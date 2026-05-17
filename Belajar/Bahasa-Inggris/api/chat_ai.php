<?php
session_start();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';
$context = $data['context'] ?? [];

if (empty($message)) {
    die(json_encode(['reply' => 'Please say something.']));
}

require_once __DIR__ . '/../../../config.php';

// Prepare payload for Gemini API
$gemini_api_key = getenv('GEMU_GEMINI_API_KEY') ?: getenv('GEMINI_API_KEY');

if (!$gemini_api_key) {
    // Advanced fallback if no API key
    $replies = [
        "That's an interesting perspective. Could you elaborate on why you think that way, using more complex vocabulary?",
        "I understand your point. To improve your fluency, try rephrasing that sentence using the past perfect tense.",
        "Good effort! However, let's focus on your preposition usage. How would you correct the prepositions in your sentence?",
        "I see. Let's practice advanced grammar. Can you turn that statement into a conditional sentence?",
        "Your message is clear, but we need to work on making it sound more natural. What idioms could you use here?"
    ];
    // Simple basic keyword matching for a faux-smart response
    $lower = strtolower($message);
    if (strpos($lower, 'climate') !== false || strpos($lower, 'environment') !== false || strpos($lower, 'pollution') !== false) {
        $reply = "You brought up environmental issues. That's a crucial topic. Could you explain the economic impact of solving this issue? (Note: Grammar evaluation requires Gemini API Key)";
    } elseif (strpos($lower, 'war') !== false || strpos($lower, 'peace') !== false || strpos($lower, 'conflict') !== false) {
        $reply = "Global conflicts are complex. Try to use the phrase 'diplomatic resolution' in your next sentence to expand your vocabulary. (Note: Grammar evaluation requires Gemini API Key)";
    } elseif (strpos($lower, 'economy') !== false || strpos($lower, 'money') !== false || strpos($lower, 'poverty') !== false) {
        $reply = "Economic disparity is a massive challenge. Let's check your grammar: Did you use the correct verb tense when describing the current situation? (Note: Grammar evaluation requires Gemini API Key)";
    } else {
        $reply = $replies[array_rand($replies)] . " (Note: Full grammar analysis requires Gemini API Key configuration.)";
    }

    die(json_encode(['reply' => $reply]));
}

$api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $gemini_api_key;

$contents = [];
$system_prompt = "You are an advanced, strict, but encouraging English language tutor.
Your goal is to assess the user's English proficiency.
The current topic is: 'What do you think is the biggest challenge facing the world today, and how should we solve it?'
Reply naturally to their message, but you MUST always include a short, specific critique of their grammar, vocabulary, or sentence structure at the end of your message.
If they made a mistake, point it out and correct it. If it was perfect, tell them why it was good and suggest a more advanced word they could have used.
Keep your entire response under 4 sentences.";

$contents[] = [
    'role' => 'user',
    'parts' => [['text' => $system_prompt . "\nUser message: " . $message]]
];

$payload = json_encode(['contents' => $contents]);

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
curl_close($ch);

$resData = json_decode($response, true);
$replyText = $resData['candidates'][0]['content']['parts'][0]['text'] ?? "I'm having trouble processing that right now. Could you try rephrasing your sentence to be more concise?";

echo json_encode(['reply' => $replyText]);
