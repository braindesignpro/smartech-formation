<?php
/**
 * Smartech Formations Mahdia — envoi des demandes d'inscription / contact.
 *
 * Destinataire : direction@smartech-formations.com
 * Déploiement : hébergement PHP avec mail() / sendmail correctement configuré.
 *
 * Sécurité : honeypot, limitation de taille, validation, anti-spam temporel (session).
 */

declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

const TO_EMAIL = 'direction@smartech-formations.com';
const FROM_EMAIL = 'noreply@smartech-formations.com';
const FROM_NAME = 'Smartech Formations — Site web';
const RATE_LIMIT_SECONDS = 50;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'error' => 'Méthode non autorisée.'], 405);
}

// Champ leurre (bots) — laisser vide côté HTML
if (!empty(trim((string) ($_POST['website'] ?? '')))) {
    json_response(['ok' => true, 'message' => 'Demande enregistrée.']);
}

$now = time();
if (!empty($_SESSION['lead_last_send']) && ($now - (int) $_SESSION['lead_last_send']) < RATE_LIMIT_SECONDS) {
    json_response(
        [
            'ok' => false,
            'error' => 'Veuillez patienter quelques instants avant d’envoyer une nouvelle demande.',
        ],
        429
    );
}

$source = isset($_POST['form_source']) ? trim((string) $_POST['form_source']) : 'accueil';

if ($source === 'entrepreneuriat') {
    handle_entrepreneuriat_form();
}

if ($source === 'entreprise-ia') {
    handle_entreprise_ia_form();
}

handle_accueil_form();

/**
 * Formulaire « Former mon équipe » — Intelligence artificielle
 */
function handle_entreprise_ia_form(): void
{
    $entreprise = clip_str($_POST['entreprise'] ?? '', 160);
    $nom = clip_str($_POST['nom'] ?? '', 160);
    $telephone = clip_str($_POST['telephone'] ?? '', 48);
    $email = clip_str($_POST['email'] ?? '', 120);
    $participants = clip_str($_POST['participants'] ?? '', 12);
    $formation = clip_str($_POST['formation'] ?? '', 200);
    $message = clip_str($_POST['message'] ?? '', 4000);

    if ($entreprise === '' || mb_strlen($entreprise) < 2) {
        json_response(['ok' => false, 'error' => 'Indiquez le nom de l’entreprise.'], 422);
    }

    if ($nom === '' || mb_strlen($nom) < 2) {
        json_response(['ok' => false, 'error' => 'Indiquez le nom du contact.'], 422);
    }

    if ($telephone === '' || !is_valid_phone($telephone)) {
        json_response(['ok' => false, 'error' => 'Indiquez un numéro de téléphone valide.'], 422);
    }

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'error' => 'L’adresse email n’est pas valide.'], 422);
    }

    if ($formation === '') {
        $formation = 'Formation entreprise — Intelligence artificielle';
    }

    $fields = [
        'Entreprise' => $entreprise,
        'Contact' => $nom,
        'Téléphone' => $telephone,
        'Email' => $email !== '' ? $email : '—',
        'Participants' => $participants !== '' ? $participants : '—',
        'Formation / besoin' => $formation,
        'Message' => $message !== '' ? $message : '—',
    ];

    $subject = '[Smartech] Entreprise IA — ' . mb_substr($entreprise, 0, 50);
    $meta = [
        'source' => 'Former mon équipe (Intelligence artificielle)',
        'page' => 'https://www.smartech-formations.com/formations-intelligence-artificielle.html#former-equipe',
    ];

    if (!send_branded_mail($subject, $fields, $email, $meta)) {
        json_response(['ok' => false, 'error' => 'L’envoi a échoué. Réessayez plus tard ou contactez-nous par téléphone.'], 500);
    }

    $_SESSION['lead_last_send'] = time();
    json_response(['ok' => true, 'message' => 'Demande envoyée.']);
}

/**
 * Formulaire page d'accueil (#inscription)
 */
function handle_accueil_form(): void
{
    $nom = clip_str($_POST['nom'] ?? '', 160);
    $telephone = clip_str($_POST['telephone'] ?? '', 48);
    $email = clip_str($_POST['email'] ?? '', 120);
    $formation = clip_str($_POST['formation'] ?? '', 200);
    $niveau = clip_str($_POST['niveau'] ?? '', 80);
    $message = clip_str($_POST['message'] ?? '', 4000);

    if ($nom === '' || mb_strlen($nom) < 2) {
        json_response(['ok' => false, 'error' => 'Indiquez votre nom complet (au moins 2 caractères).'], 422);
    }

    if ($telephone === '' || !is_valid_phone($telephone)) {
        json_response(['ok' => false, 'error' => 'Indiquez un numéro de téléphone valide.'], 422);
    }

    if ($formation === '') {
        json_response(['ok' => false, 'error' => 'Choisissez une formation.'], 422);
    }

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'error' => 'L’adresse email n’est pas valide.'], 422);
    }

    $fields = [
        'Nom complet' => $nom,
        'Téléphone' => $telephone,
        'Email' => $email !== '' ? $email : '—',
        'Formation souhaitée' => $formation,
        'Niveau actuel' => $niveau !== '' ? $niveau : '—',
        'Message' => $message !== '' ? $message : '—',
    ];

    $subject = '[Smartech] Nouvelle inscription — ' . mb_substr($formation, 0, 60);
    $meta = [
        'source' => 'Formulaire d’inscription (page d’accueil)',
        'page' => 'https://www.smartech-formations.com/#inscription',
    ];

    if (!send_branded_mail($subject, $fields, $email, $meta)) {
        json_response(['ok' => false, 'error' => 'L’envoi a échoué. Réessayez plus tard ou contactez-nous par téléphone.'], 500);
    }

    $_SESSION['lead_last_send'] = time();
    json_response(['ok' => true, 'message' => 'Demande envoyée.']);
}

/**
 * Formulaire tunnel entrepreneuriat
 */
function handle_entrepreneuriat_form(): void
{
    $prenom = clip_str($_POST['prenom'] ?? '', 80);
    $nom = clip_str($_POST['nom'] ?? '', 80);
    $telephone = clip_str($_POST['telephone'] ?? '', 48);
    $email = clip_str($_POST['email'] ?? '', 120);
    $formation = clip_str($_POST['formation'] ?? '', 200);
    $msg = clip_str($_POST['message'] ?? '', 4000);

    if ($prenom === '' || mb_strlen($prenom) < 2) {
        json_response(['ok' => false, 'error' => 'Indiquez votre prénom.'], 422);
    }

    if ($nom === '' || mb_strlen($nom) < 2) {
        json_response(['ok' => false, 'error' => 'Indiquez votre nom.'], 422);
    }

    if ($telephone === '' || !is_valid_phone($telephone)) {
        json_response(['ok' => false, 'error' => 'Indiquez un numéro de téléphone valide.'], 422);
    }

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'error' => 'L’adresse email n’est pas valide.'], 422);
    }

    if ($formation === '') {
        $formation = 'Formation entrepreneuriale complète — De l’idée au succès';
    }

    $fields = [
        'Prénom' => $prenom,
        'Nom' => $nom,
        'Téléphone' => $telephone,
        'Email' => $email !== '' ? $email : '—',
        'Formation' => $formation,
        'Message' => $msg !== '' ? $msg : '—',
    ];

    $subject = '[Smartech] Entrepreneuriat — ' . $prenom . ' ' . $nom;
    $meta = [
        'source' => 'Tunnel entrepreneuriat (inscription)',
        'page' => 'https://www.smartech-formations.com/entrepreneuriat-inscription.html',
    ];

    if (!send_branded_mail($subject, $fields, $email, $meta)) {
        json_response(['ok' => false, 'error' => 'L’envoi a échoué. Réessayez plus tard ou utilisez WhatsApp.'], 500);
    }

    $_SESSION['lead_last_send'] = time();
    json_response(['ok' => true, 'message' => 'Demande envoyée.', 'prenom' => $prenom]);
}

function clip_str(string $value, int $max): string
{
    $value = trim(strip_tags($value));

    return mb_strlen($value) > $max ? mb_substr($value, 0, $max) : $value;
}

function is_valid_phone(string $tel): bool
{
    $len = mb_strlen(preg_replace('/\s+/', '', $tel) ?: '');

    return $len >= 8 && $len <= 32 && preg_match('/^[\d\s+().\-]+$/u', $tel) === 1;
}

/**
 * Email HTML + texte brut, charte Smartech.
 *
 * @param array<string, string> $fields
 * @param array{source?: string, page?: string} $meta
 */
function send_branded_mail(string $subject, array $fields, string $replyToEmail, array $meta = []): bool
{
    $boundary = 'sm_' . bin2hex(random_bytes(12));
    $when = date('d/m/Y à H:i');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
    $source = $meta['source'] ?? 'Formulaire site web';
    $page = $meta['page'] ?? 'https://www.smartech-formations.com/';

    $plain = build_plain_body($fields, $source, $page, $when, $ip);
    $html = build_html_body($fields, $source, $page, $when, $ip);

    $replyTo = filter_var($replyToEmail, FILTER_VALIDATE_EMAIL)
        ? $replyToEmail
        : TO_EMAIL;

    $fromHeader = encode_header_name(FROM_NAME) . ' <' . FROM_EMAIL . '>';

    $headers = [
        'MIME-Version: 1.0',
        'From: ' . $fromHeader,
        'Reply-To: ' . $replyTo,
        'To: ' . TO_EMAIL,
        'X-Mailer: Smartech-Formations/' . PHP_VERSION,
        'X-Priority: 1',
        'Importance: High',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    ];

    $body = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $plain . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $html . "\r\n\r\n";
    $body .= "--{$boundary}--\r\n";

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    return @mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers));
}

/**
 * @param array<string, string> $fields
 */
function build_plain_body(array $fields, string $source, string $page, string $when, string $ip): string
{
    $lines = [
        'Smartech Formations Mahdia — Nouvelle demande',
        str_repeat('=', 48),
        '',
        'Source : ' . $source,
        'Page : ' . $page,
        'Date : ' . $when,
        '',
    ];

    foreach ($fields as $label => $value) {
        $lines[] = $label . ' : ' . $value;
    }

    $lines[] = '';
    $lines[] = 'IP : ' . $ip;
    $lines[] = '— Message généré automatiquement depuis le site smartech-formations.com';

    return implode("\n", $lines);
}

/**
 * @param array<string, string> $fields
 */
function build_html_body(array $fields, string $source, string $page, string $when, string $ip): string
{
    $rows = '';
    foreach ($fields as $label => $value) {
        $safeLabel = htmlspecialchars($label, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $safeValue = nl2br(htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
        $rows .= <<<HTML
          <tr>
            <td style="padding:14px 16px;border-bottom:1px solid #e8eef5;width:38%;vertical-align:top;font-size:13px;font-weight:700;color:#123b5d;background:#f7f9fc;">{$safeLabel}</td>
            <td style="padding:14px 16px;border-bottom:1px solid #e8eef5;vertical-align:top;font-size:14px;line-height:1.55;color:#111827;">{$safeValue}</td>
          </tr>
HTML;
    }

    $safeSource = htmlspecialchars($source, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safePage = htmlspecialchars($page, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeWhen = htmlspecialchars($when, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeIp = htmlspecialchars($ip, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $phone = '';
    foreach ($fields as $label => $value) {
        if (mb_stripos($label, 'téléphone') !== false || mb_stripos($label, 'telephone') !== false) {
            $digits = preg_replace('/[^\d+]/', '', $value) ?: '';
            if ($digits !== '') {
                $phone = $digits;
            }
            break;
        }
    }

    $ctaBlock = '';
    if ($phone !== '') {
        $telHref = htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $waDigits = preg_replace('/\D+/', '', $phone) ?: '';
        if (strlen($waDigits) === 8) {
            $waDigits = '216' . $waDigits;
        }
        $waHref = htmlspecialchars('https://wa.me/' . $waDigits, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $ctaBlock = <<<HTML
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="tel:{$telHref}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#123b5d;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">Appeler le prospect</a>
                  </td>
                  <td>
                    <a href="{$waHref}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#18a957;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">WhatsApp</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
HTML;
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle demande — Smartech Formations</title>
</head>
<body style="margin:0;padding:0;background:#eef4fb;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef4fb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(18,59,93,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#123b5d 0%,#1a6fa0 55%,#2fafe3 100%);padding:28px 28px 24px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:800;color:#f8c515;">Smartech Formations Mahdia</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:800;">Nouvelle demande reçue</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.92);">{$safeSource}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 8px;">
              <p style="margin:0 0 6px;font-size:13px;color:#5f6f82;"><strong style="color:#123b5d;">Date :</strong> {$safeWhen}</p>
              <p style="margin:0 0 18px;font-size:13px;color:#5f6f82;"><strong style="color:#123b5d;">Page :</strong> <a href="{$safePage}" style="color:#2fafe3;text-decoration:none;">{$safePage}</a></p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d9e5f2;border-radius:14px;overflow:hidden;">
                {$rows}
              </table>
            </td>
          </tr>
          {$ctaBlock}
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;padding:14px 16px;border-radius:12px;background:#f7f9fc;border:1px solid #e8eef5;font-size:12px;line-height:1.5;color:#5f6f82;">
                IP : {$safeIp}<br />
                Répondez directement à cet email si le prospect a laissé une adresse (Reply-To).
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f2742;padding:18px 28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.78);">Centre de formation professionnelle — Mahdia, Tunisie</p>
              <p style="margin:6px 0 0;font-size:12px;">
                <a href="https://www.smartech-formations.com/" style="color:#f8c515;text-decoration:none;font-weight:700;">smartech-formations.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}

function encode_header_name(string $name): string
{
    return '=?UTF-8?B?' . base64_encode($name) . '?=';
}

function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
