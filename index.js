const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
const port = 3000;

const authenticate = (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
        // Perform token validation logic here
        const systemToken = process.env.BEARER_TOKEN || 'olo';
        if (token === systemToken) {
            next();
        } else {
            res.status(401).send('Invalid bearer token');
        }
    } else {
        res.status(401).send('No bearer token provided');
    }
}

app.get('/', (req, res) => {
    res.send('No slug provided');
});

app.get('/entries', authenticate, (req, res) => {
    if (!fs.existsSync('entries.json')) {
        return res.send('No entries');
    }
    res.send(JSON.parse(fs.readFileSync('entries.json', 'utf8')));
});

app.get('/:slug', (req, res) => {
    const { slug } = req.params;
    // Perform logic based on the slug value
    if (fs.existsSync('entries.json')) {
        const entries = JSON.parse(fs.readFileSync('entries.json', 'utf8'));
        if (entries[slug]) {
            res.redirect(entries[slug]);
        } else {
            res.status(404).send('Not found');
        }
    } else {
        res.status(404).send('No entries');
    }
});

app.post('/entry', authenticate, (req, res) => {
    const { slug, content } = req.body;
    if(!content) return res.status(400).send('Content is required');
    if(!fs.existsSync('entries.json')) {
        fs.writeFileSync('entries.json', '{}');
    }
    const entries = JSON.parse(fs.readFileSync('entries.json', 'utf8'));
    const newSlug = slug || Math.random().toString(36).substring(2, 8);
    entries[newSlug] = content;
    fs.writeFileSync('entries.json', JSON.stringify(entries, null, 2));
    res.send('Entry added successfully');
});

app.delete('/entry/:slug', authenticate, (req, res) => {
    const { slug } = req.params;
    const entries = JSON.parse(fs.readFileSync('entries.json', 'utf8'));
    if (entries[slug]) {
        delete entries[slug];
        fs.writeFileSync('entries.json', JSON.stringify(entries, null, 2));
        res.send('Entry deleted successfully');
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});