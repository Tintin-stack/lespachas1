require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://nrpgpzivubnkwzzyvelb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycGdweml2dWJua3d6enl2ZWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDEwOTIsImV4cCI6MjA1ODMxNzA5Mn0.tfv6wP6x6b06BlhpE68Yr6FaQUkDhNWvClRn5U_1WxM'
);

async function testConnection() {
    console.log('Test de connexion à Supabase...');
    
    try {
        // Test 1: Création d'un utilisateur
        const testUser = {
            email: 'test@example.com',
            password: 'hashedpassword123',
            is_admin: false
        };
        
        console.log('1. Tentative de création d\'un utilisateur...');
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([testUser])
            .select();
            
        if (insertError) {
            throw insertError;
        }
        console.log('✅ Création d\'utilisateur réussie:', newUser);
        
        // Test 2: Lecture d'utilisateur
        console.log('\n2. Tentative de lecture d\'un utilisateur...');
        const { data: users, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'test@example.com');
            
        if (selectError) {
            throw selectError;
        }
        console.log('✅ Lecture d\'utilisateur réussie:', users);
        
        // Test 3: Suppression du test
        console.log('\n3. Nettoyage - Suppression de l\'utilisateur test...');
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('email', 'test@example.com');
            
        if (deleteError) {
            throw deleteError;
        }
        console.log('✅ Suppression réussie');
        
        console.log('\n✅ Tous les tests ont réussi !');
    } catch (error) {
        console.error('❌ Erreur pendant les tests:', error);
    }
}

testConnection(); 