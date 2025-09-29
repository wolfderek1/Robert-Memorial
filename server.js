const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Load messages from file
async function loadMessages() {
    try {
        const data = await fs.readFile(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // File doesn't exist yet, return empty array
        return [];
    }
}

// Save messages to file
async function saveMessages(messages) {
    try {
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving messages:', error);
        return false;
    }
}

// Routes
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await loadMessages();
        res.json(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        res.status(500).json({ error: 'Failed to load messages' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, relationship, message } = req.body;
        
        // Validate required fields
        if (!name || !message) {
            return res.status(400).json({ error: 'Name and message are required' });
        }
        
        // Create new message object
        const newMessage = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email ? email.trim() : '',
            relationship: relationship || '',
            message: message.trim(),
            timestamp: new Date().toISOString(),
            likes: 0
        };
        
        // Load existing messages
        const messages = await loadMessages();
        
        // Add new message to the beginning
        messages.unshift(newMessage);
        
        // Save updated messages
        const saved = await saveMessages(messages);
        
        if (saved) {
            res.status(201).json({ success: true, message: newMessage });
        } else {
            res.status(500).json({ error: 'Failed to save message' });
        }
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

app.post('/api/messages/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await loadMessages();
        
        const messageIndex = messages.findIndex(msg => msg.id === id);
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        messages[messageIndex].likes = (messages[messageIndex].likes || 0) + 1;
        
        const saved = await saveMessages(messages);
        if (saved) {
            res.json({ success: true, likes: messages[messageIndex].likes });
        } else {
            res.status(500).json({ error: 'Failed to update likes' });
        }
    } catch (error) {
        console.error('Error updating likes:', error);
        res.status(500).json({ error: 'Failed to update likes' });
    }
});

// Start server
async function startServer() {
    await ensureDataDirectory();
    app.listen(PORT, () => {
        console.log(`Memorial server running on http://localhost:${PORT}`);
        console.log(`Messages will be saved to: ${MESSAGES_FILE}`);
    });
}

startServer();