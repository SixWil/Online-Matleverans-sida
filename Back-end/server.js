import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

// const db = new pg.Client({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'OnlineMatLeverans',
//     password: 'OgreMail',
//     port: 5432,
// });

// db.connect()
//     .then(() => console.log('Connected to PostgreSQL database'))

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

app.get('/login', (req, res) => {
    res.render('konto.ejs', { title: 'Konto sida' });
});

app.get('/beskrivningar', (req, res) => {
    res.render('beskrivningar.ejs', { title: 'Menyerna' });
});

app.get('/registrera', (req, res) => {
    res.render('registrera.ejs', { title: 'Registrera' });
});

app.get('/Abracadabra/abra-cadabra', (req, res) => {
    res.render('Abracadabra/abra-cadabra.ejs');
});

app.get('/Abracadabra/brisket-platter', (req, res) => {
    res.render('Abracadabra/Maträtt-brisket-platter.ejs');
});

app.get('/Abracadabra/kyckling', (req, res) => {
    res.render('Abracadabra/Maträtt-kyckling.ejs');
});

app.get('/Abracadabra/ribs', (req, res) => {
    res.render('Abracadabra/Maträtt-ribs.ejs');
});

app.get('/Agatas/agatas', (req, res) => {
    res.render('Agatas/agatas.ejs');
});

app.get('/Agatas/avocado-toast', (req, res) => {
    res.render('Agatas/Maträtt-avocado-toast.ejs');
});

app.get('/Agatas/choklad-pudding', (req, res) => {
    res.render('Agatas/Maträtt-choklad-pudding.ejs');
});

app.get('/Agatas/soppa', (req, res) => {
    res.render('Agatas/Maträtt-räk-soppa.ejs');
});

app.get('/Pretantieuse/pretentieuse', (req, res) => {
    res.render('Pretantieuse/pretentieuse.ejs');
});

app.get('/Pretantieuse/moln', (req, res) => {
    res.render('Pretantieuse/Maträtt-moln.ejs');
});

app.get('/Pretantieuse/centaur', (req, res) => {
    res.render('Pretantieuse/Maträtt-centaur.ejs');
});

app.get('/Pretantieuse/slag', (req, res) => {
    res.render('Pretantieuse/Maträtt-slag.ejs');
});

var order = [];
order.push({payment: 0}); // Initialize the order array with a payment object
order.push({cost: 0, delivery: 0, tax: 0}); // Initialize the order array with a payment object

app.get('/leverans', (req, res) => {
    res.render('leverans.ejs', { title: 'Kundvagn', order: order });
});

///          Funktion som hanterar beställningar         ///
///          och lägger till dem i en array           ///
///          och uppdaterar totalsumman               ///


function shopping(req, res, name, price, addition=1,) {

    const existingItem = order.find( (item) => item.name === name); // Find the item in the array

    if (existingItem) {
        existingItem.amount += addition; // Increment the amount if the item exists
        existingItem.total = existingItem.price * existingItem.amount; // Update the total price
    } 
    else {
        order.push({ name: name, price: price, amount: 1, total: price }); // Add a new item if it doesn't exist
    }
    
    var cost = 0;

    order[0].payment = 0;

    for (let i = 2; i < order.length; i++) {
        cost += order[i].total; // Calculate the total payment
    };

    order[1].cost = cost; // Update the payment in the first item of the array
    order[1].delivery = 100; // delivery fee
    order[1].tax = (order[1].cost + order[1].delivery) * 0.1; // Calculate the tax

    order[0].payment = order[1].cost + order[1].delivery + order[1].tax; // Update the payment in the first item of the array
    
    console.log(order);


    /// BASTARD som suger jättemycket men som kanske måste vara där ///
    res.redirect(req.get('referer')); // Redirect to the previous page


}

var account = 123; // Dummy account number

app.post('/confirm', async (req, res) => { 
    console.log(order); // Log the order array to the console

    var batch = await db.query('select batch from orders').rows.at(-1).batch +1; // Get the last batch number from the database
    
    for (let i = 2; i < order.length; i++) {
        await db.query('INSERT INTO orders (food, price_per, ammount, account, batch) VALUES ($1, $2, $3, $4, $5)', [order[i].name, order[i].price, order[i].amount, account, batch]);
    };

    order = []; // Clear the order array after inserting into the database
    order.push({payment: 0}); // Initialize the order array with a payment object
    order.push({cost: 0, delivery: 0, tax: 0}); // Initialize the order array with a payment object
    
    // console.log(batch); // Log the batch number to the console

    res.redirect(req.get('referer')); // Redirect to the previous page

});



app.post('/buy/Oxbringa', (req, res) => {
    shopping(req, res, 'Oxbringa', 200 )
});

app.post('/buy/Revben', (req, res) => { 
    shopping(req, res, 'Revben', 350 )
});

app.post('/buy/Kyckling', (req, res) => { 
    shopping(req, res, 'Kyckling', 150 )
});

app.post('/buy/AvacadoToast', (req, res) => { 
    shopping(req, res, 'AvacadoToast', 50 )
});

app.post('/buy/ChockladPudding', (req, res) => { 
    shopping(req, res, 'ChocladPudding', 35 )
});

app.post('/buy/Soppa', (req, res) => { 
    shopping(req, res, 'RäkSoppa', 60 )
});

app.post('/buy/Moln', (req, res) => { 
    shopping(req, res, 'Moln', 2000 )
});

app.post('/buy/Centaur', (req, res) => { 
    shopping(req, res, 'Centaur', 35000 )
});

app.post('/buy/Slag', (req, res) => { 
    shopping(req, res, 'Slag', 450 )
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});