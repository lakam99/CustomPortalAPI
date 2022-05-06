export function sanitize_string(str) {
    var clean = new RegExp(/["\*\d,;{}\[\]!@#$%\^&\(\)/\\\\]/g);
    return str.replace(clean,'');
}

export function today_add(days:number):Date {
    return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
}