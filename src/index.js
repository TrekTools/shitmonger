client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Set bot's avatar
    try {
        await client.user.setAvatar('./src/monger.jpg');
        console.log('Successfully set bot avatar');
    } catch (error) {
        console.error('Error setting avatar:', error);
    }
    
    // ... rest of ready event code ...
}); 