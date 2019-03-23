<?php
if (empty($_POST) || empty($_POST['input']) || empty($_POST['value'])) {
    exit();
}

$status = false;
$data = null;
$error = null;

switch ($_POST['input']) {
    case 'name':
    if (strtolower($_POST['value']) === 'admin') {
        $error = array(
        $_POST['input'] => 'Пожалуста, введите Ваше реальное имя.'
        );
    } elseif (strtolower($_POST['value']) === 'administrator') {
        $error = array(
        $_POST['input'] => 'Пожалуста, введите Ваше реальное имя.'
        );
    } elseif (strtolower($_POST['value']) === 'user') {
        $error = array(
        $_POST['input'] => 'Пожалуста, введите Ваше реальное имя.'
        );
    } elseif (strtolower($_POST['value']) === 'root') {
        $error = array(
        $_POST['input'] => 'Пожалуста, введите Ваше реальное имя.'
        );
    } else {
        $status = true;
        $data = array(
        $_POST['input'] => 'Username is Available!'
        );
    }
    break;
    case 'email':
    $matches = [];
    preg_match('/^([a-zA-Z0-9_+.-]+)@([a-z-]+)\\.([a-z-]{2,})$/', $_POST['value'], $matches);
    if (strtolower($_POST['value']) != strtolower($matches[0])) {
        $error = array(
        $_POST['input'] => 'Пожалуйста, введите корректный Email.'
        );
    } else {
        $status = true;
        $data = array(
        $_POST['input'] => 'Email is Available!'
        );
    }
    break;
    case 'subject':
    $matches_subj = [];
    preg_match('/^[A-ZА-ЯЁ][A-ZА-ЯЁa-zа-яё\\s]+?$/u', $_POST['value'], $matches_subj);
    if ($_POST['value'] != $matches_subj[0] && $_POST['value'] != "" || $_POST['value'] == "") {
        $error = array(
        $_POST['input'] => 'Пожалуйста, выберите тему.'
        );
    } else {
        $status = true;
        $data = array(
        $_POST['input'] => 'Subject is Available!'
        );
    }
    break;
    case 'message':
    $mess_split = preg_split('//u', htmlspecialchars($_POST['value']), -1, PREG_SPLIT_NO_EMPTY);
    $mess_replace = NULL;
    foreach($mess_split as $key => $value) {
        if (preg_match('/(<|\\/|%|>|\\\\)/ui', $mess_split[$key])) {
            $mess_split[$key] = preg_replace('/(<|\\/|%|>|\\\\)/ui', ' *ZZZ* ', $value);
        }
    }
    for ($i = 0; $i < count($mess_split); $i++) {
        $mess_replace .= $mess_split[$i];
    }
    $_POST['value'] = $mess_replace;
    if ($_POST['value'] == NULL || $_POST['value'] == "" || $mess_replace != $_POST['value'] && $_POST['value'] != "") {
        $error = array(
        $_POST['input'] => 'Пожалуйста, введите корректное сообщение.'
        );
    } else {
        $status = true;
        $data = array(
        $_POST['input'] => 'Message is Available!',
        $_POST['value']
        );
    }
    break;
}
echo json_encode(
    array(
        'status' => $status,
        'data' => $data,
        'error' => $error
    )
);
?>
