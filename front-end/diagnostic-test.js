/**
 * TEST DE DIAGNOSTIC
 * Copiez ce code dans la console de my-characters.html
 */

// Test 1: Vérifier que playCharacter existe
console.log('✅ Test 1: playCharacter existe?', typeof playCharacter);

// Test 2: Appeler playCharacter manuellement
console.log('🧪 Test 2: Appel manuel de playCharacter(1)');
playCharacter(1);

// Après 2 secondes, vérifier l'URL
setTimeout(() => {
    console.log('📍 URL actuelle:', window.location.href);
}, 2000);

// Test 3: Redirection directe
console.log('🧪 Test 3: Redirection directe dans 5 secondes...');
setTimeout(() => {
    console.log('🔗 Tentative de redirection vers play.html?id=999');
    window.location.href = 'play.html?id=999';
}, 5000);