import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('start-sida.ejs', { title: 'Start sida' });
});

app.get('/start-sida', (req, res) => {
    res.render('start-sida.ejs', { title: 'Start sida' });
});

app.get('/om-oss', (req, res) => {
    res.render('om-oss.ejs', { title: 'Start sida' });
});

app.get('/beskrivningar', (req, res) => {
    res.render('beskrivningar.ejs', { title: 'Menyerna' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});