<?php
function gemu_dual_status(): array {
    $cfg = function_exists('gemu_nvidia_config') ? gemu_nvidia_config() : ['configured'=>false,'key_masked'=>'','model'=>'-','endpoint'=>'-'];
    $stateFile = AI_DIR . '/dual-brain-state.json';
    $queueFile = AI_DIR . '/dual-brain-queue.json';
    $state = load_json($stateFile, [
        'mode'=>'dual_brain',
        'local_brain'=>['enabled'=>true,'role'=>'memori, file lokal, scan, security, staged edit'],
        'api_brain'=>['enabled'=>true,'provider'=>'nvidia'],
        'agent_cycle'=>['count'=>0,'last_at'=>null,'last_focus'=>'standby'],
        'stats'=>['api_calls'=>0,'local_answers'=>0,'hybrid_answers'=>0,'failed_api_calls'=>0],
    ]);
    $queue = load_json($queueFile, []);
    $state['api_brain']['configured'] = !empty($cfg['configured']);
    $state['api_brain']['model'] = $cfg['model'] ?? '-';
    $state['api_brain']['endpoint'] = $cfg['endpoint'] ?? '-';
    $state['api_brain']['key_masked'] = $cfg['key_masked'] ?? '';
    $state['queue'] = [
        'total'=>count($queue),
        'pending'=>count(array_filter($queue, fn($t)=>($t['status'] ?? '') === 'pending')),
        'done'=>count(array_filter($queue, fn($t)=>($t['status'] ?? '') === 'done')),
        'items'=>array_slice($queue, 0, 20),
    ];
    return $state;
}

function gemu_dual_save_status(array $state): void {
    $state['updated_at'] = date('Y-m-d H:i:s');
    save_json(AI_DIR . '/dual-brain-state.json', $state);
}

function gemu_dual_add_task(string $title, string $type = 'analysis'): array {
    $queueFile = AI_DIR . '/dual-brain-queue.json';
    $queue = load_json($queueFile, []);
    $task = ['id'=>bin2hex(random_bytes(5)), 'title'=>safe_text($title,220), 'type'=>safe_text($type,60), 'status'=>'pending', 'created_at'=>date('Y-m-d H:i:s')];
    array_unshift($queue, $task);
    save_json($queueFile, array_slice($queue, 0, 60));
    add_activity('dual-brain', 'Task dual-brain masuk queue: '.$task['title'], ['task_id'=>$task['id']]);
    return $task;
}

function gemu_dual_prompt_messages(string $question, array $router, string $localDraft): array {
    $memory = load_json($GLOBALS['memoryFile'], []);
    $recent = array_map(fn($m)=>'- '.safe_text($m['text'] ?? '',180), array_slice($memory,0,8));
    $context = "Memori terbaru:\n".implode("\n", $recent)."\n\nRouter lokal:\n".json_encode($router, JSON_UNESCAPED_UNICODE)."\n\nDraft lokal:\n".$localDraft;
    return [
        ['role'=>'system','content'=>'Kamu adalah GEMU AI untuk owner Darma. Jawab bahasa Indonesia. Fokus teknis, aman, ringkas, dan siap dipakai. Semua perubahan website harus melalui staged edit dan approve owner.'],
        ['role'=>'user','content'=>safe_text($context."\n\nPertanyaan owner:\n".$question, 5200)]
    ];
}

function gemu_dual_reply(string $question, string $mode='owner'): array {
    $question = normalize_prompt(safe_text($question, 1200));
    $router = gemu_reasoning_router($question, $mode);
    $local = concise_local_reply($question, $mode);
    $localMsg = (string)($local['message'] ?? '');
    $needsApi = preg_match('/\b(api|nvidia|otak dua|dual brain|agent|multitasking|arsitektur|rencana|analisis dalam|canggih|professional)\b/i', $question) || strlen($localMsg) < 160;
    $state = gemu_dual_status();
    $api = null;
    $provider = 'local';
    $final = $localMsg;
    if ($needsApi && function_exists('gemu_nvidia_chat')) {
        $api = gemu_nvidia_chat(gemu_dual_prompt_messages($question, $router, $localMsg));
        if (!empty($api['ok'])) {
            $provider = 'hybrid_nvidia';
            $final = trim((string)$api['message']);
            $state['stats']['api_calls'] = (int)($state['stats']['api_calls'] ?? 0) + 1;
            $state['stats']['hybrid_answers'] = (int)($state['stats']['hybrid_answers'] ?? 0) + 1;
        } else {
            $provider = 'local_fallback';
            $state['stats']['failed_api_calls'] = (int)($state['stats']['failed_api_calls'] ?? 0) + 1;
            $final = $localMsg."\n\nCatatan dual-brain: otak lokal aktif, tetapi NVIDIA API belum berhasil dipakai. ".($api['message'] ?? 'Cek konfigurasi API.');
        }
    } else {
        $state['stats']['local_answers'] = (int)($state['stats']['local_answers'] ?? 0) + 1;
    }
    $state['agent_cycle']['count'] = (int)($state['agent_cycle']['count'] ?? 0) + 1;
    $state['agent_cycle']['last_at'] = date('Y-m-d H:i:s');
    $state['agent_cycle']['last_focus'] = safe_text($question,160);
    gemu_dual_save_status($state);
    add_activity('dual-brain', 'Dual brain menjawab owner via '.$provider.'.', ['provider'=>$provider]);
    append_owner_chat('gemu', $final, ['source'=>'dual-brain','provider'=>$provider,'router'=>$router]);
    return ['message'=>$final, 'provider'=>$provider, 'router'=>$router, 'local'=>$local, 'api'=>$api, 'dual_brain'=>gemu_dual_status()];
}

function gemu_dual_run_cycle(string $reason='manual'): array {
    $queueFile = AI_DIR . '/dual-brain-queue.json';
    $queue = load_json($queueFile, []);
    $idx = null;
    foreach ($queue as $i=>$task) if (($task['status'] ?? '') === 'pending') { $idx=$i; break; }
    $processed = null;
    if ($idx !== null) {
        $task = $queue[$idx];
        $reply = gemu_dual_reply('Kerjakan task queue GEMU secara aman: '.$task['title'], 'owner');
        $queue[$idx]['status'] = 'done';
        $queue[$idx]['result'] = safe_text($reply['message'] ?? '', 1400);
        $queue[$idx]['provider'] = $reply['provider'] ?? 'local';
        $queue[$idx]['updated_at'] = date('Y-m-d H:i:s');
        $processed = $queue[$idx];
        save_json($queueFile, $queue);
    }
    return ['message'=>$processed ? 'Dual-brain cycle selesai. Satu task diproses.' : 'Dual-brain cycle selesai. Tidak ada task pending.', 'processed'=>$processed, 'dual_brain'=>gemu_dual_status()];
}
?>