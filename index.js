const express = require('express')
const app = express();
const PORT = 3000;
const db = require('./models');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.listen(PORT, () => {
    console.log('Server started on port 3000');
})

db.sequelize.sync()
.then((result) => {
    app.listen(3000, () => {console.log('Server started')});
})
.catch((err) => {console.log(err)})

app.post('/komik', async (req, res) => {
    try {
        const komik = await db.Komik.create(data);
        res.send(komik);
    } catch (error) {
        res.send(error);
    }
})

app.get('/komik', async (req, res) => {
    try {
        const komik = await db.Komik.findAll();
        res.send(komik);
    } catch (error) {
        res.send(error);
    }
})

app.put('/komik/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const komik = await db.Komik.findByPk(id);
        if (!komik) {
            return res.status(404).send({ message: 'Komik not found' });
        }
        await komik.update(data);
        res.send({message: 'Komik updated successfully', komik});
    } catch (error) {
        res.status(500).send(error);
    }
})

app.delete('/komik/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const komik = await db.Komik.findByPk(id);
        if (!komik) {
            return res.status(404).send({ message: 'Komik not found' });
        }
        await komik.destroy();
        res.send({message: 'Komik deleted successfully'});
    } catch (error) {
        res.status(500).send(error);
    }
})