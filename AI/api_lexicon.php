<?php
// GEMU AI LEXICON & SEMANTIC LAYER

function load_gemu_lexicon(): array {
    $file = AI_DIR . '/lexicon.json';
    if (!is_file($file)) return ['concepts' => [], 'translations' => [], 'context_rules' => []];
    $json = json_decode((string)file_get_contents($file), true);
    return is_array($json) ? $json : ['concepts' => [], 'translations' => [], 'context_rules' => []];
}

function gemu_semantic_check(string $q, string $a): array {
    $lexicon = load_gemu_lexicon();
    $qLower = strtolower($q);
    $aLower = strtolower($a);
    
    $warnings = [];
    $rules = $lexicon['context_rules'] ?? [];
    
    foreach ($rules as $rule) {
        $triggers = $rule['trigger'] ?? [];
        $matchAll = true;
        foreach ($triggers as $t) {
            if (stripos($qLower, (string)$t) === false) {
                $matchAll = false;
                break;
            }
        }
        
        if ($matchAll) {
            $mustContain = $rule['must_contain'] ?? [];
            $mustNotContain = $rule['must_not_contain'] ?? [];
            
            $foundValid = false;
            foreach ($mustContain as $valid) {
                if (stripos($aLower, (string)$valid) !== false) {
                    $foundValid = true;
                    break;
                }
            }
            
            // Jika pertanyaan mengandung trigger tapi jawaban tidak mengandung satupun must_contain (opsional, tergantung konteks)
            // Namun yang paling penting adalah must_not_contain (logic check)
            foreach ($mustNotContain as $invalid) {
                if (stripos($aLower, (string)$invalid) !== false) {
                    $warnings[] = "Jawaban menyebutkan '" . $invalid . "' padahal konteksnya adalah " . implode(' & ', $triggers) . ". Ini mungkin tidak realistis.";
                }
            }
        }
    }
    
    return [
        'ok' => count($warnings) === 0,
        'warnings' => $warnings
    ];
}

function gemu_translate_term(string $term, string $to = 'en'): string {
    $lexicon = load_gemu_lexicon();
    $trans = $lexicon['translations'] ?? [];
    
    if ($to === 'en') {
        return $trans[$term] ?? $term;
    } else {
        $flipped = array_flip($trans);
        return $flipped[$term] ?? $term;
    }
}

/**
 * Mendapatkan konsep induk dari sebuah kata
 */
function gemu_get_concept_parent(string $word): ?string {
    $lexicon = load_gemu_lexicon();
    $concepts = $lexicon['concepts'] ?? [];
    
    foreach ($concepts as $key => $data) {
        $aliases = array_merge($data['id'] ?? [], $data['en'] ?? []);
        if (in_array(strtolower($word), array_map('strtolower', $aliases), true)) {
            return $data['parent'] ?? $key;
        }
    }
    return null;
}
