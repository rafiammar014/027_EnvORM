const express = require('express');
const app = express();
const db = require('./models');
const PORT = Number(process.env.PORT || 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

db.sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
        process.exitCode = 1;
    });

function validateKomikPayload(body, partial = false) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return null;
    }

    const allowedFields = ['title', 'description', 'author'];
    const fields = Object.keys(body);

    if (
        fields.length === 0 ||
        fields.some((field) => !allowedFields.includes(field)) ||
        (!partial && (!fields.includes('title') || !fields.includes('author')))
    ) {
        return null;
    }

    const payload = {};
    for (const field of fields) {
        const value = body[field];
        if (field === 'description' && (value === null || typeof value === 'string')) {
            payload[field] = value;
        } else if (
            (field === 'title' || field === 'author') &&
            typeof value === 'string' &&
            value.trim()
        ) {
            payload[field] = value.trim();
        } else {
            return null;
        }
    }

    return payload;
}

function parseKomikId(value) {
    if (!/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
}

app.post('/komik', async (req, res) => {
    const payload = validateKomikPayload(req.body);
    if (!payload) {
        return res.status(400).json({
            message: 'title and author are required; only title, description, and author are allowed'
        });
    }

    try {
        const komik = await db.Komik.create(payload);
        res.status(201).json(komik);
    } catch (error) {
        console.error('Unable to create komik:', error);
        res.status(500).json({ message: 'Unable to create komik' });
    }
});

app.get('/komik', async (req, res) => {
    try {
        const komik = await db.Komik.findAll();
        res.json(komik);
    } catch (error) {
        console.error('Unable to retrieve komik:', error);
        res.status(500).json({ message: 'Unable to retrieve komik' });
    }
});

app.put('/komik/:id', async (req, res) => {
    const id = parseKomikId(req.params.id);
    if (id === null) {
        return res.status(400).json({ message: 'id must be a positive integer' });
    }

    const payload = validateKomikPayload(req.body, true);
    if (!payload) {
        return res.status(400).json({
            message: 'Provide valid title, description, or author fields'
        });
    }

    try {
        const komik = await db.Komik.findByPk(id);
        if (!komik) {
            return res.status(404).json({ message: 'Komik not found' });
        }
        await komik.update(payload);
        res.json({ message: 'Komik updated successfully', komik });
    } catch (error) {
        console.error('Unable to update komik:', error);
        res.status(500).json({ message: 'Unable to update komik' });
    }
});

app.delete('/komik/:id', async (req, res) => {
    const id = parseKomikId(req.params.id);
    if (id === null) {
        return res.status(400).json({ message: 'id must be a positive integer' });
    }

    try {
        const komik = await db.Komik.findByPk(id);
        if (!komik) {
            return res.status(404).json({ message: 'Komik not found' });
        }
        await komik.destroy();
        res.json({ message: 'Komik deleted successfully' });
    } catch (error) {
        console.error('Unable to delete komik:', error);
        res.status(500).json({ message: 'Unable to delete komik' });
    }
});