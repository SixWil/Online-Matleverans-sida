import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();
const port = 3000;

import pg from 'pg';

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'OnlineMatLeverans',
    password: 'OgreMail',
    port: 5432,
});

db.connect()
    .then(() => console.log('Connected to PostgreSQL database'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'superhemligt',
    resave: false,
    saveUninitialized: false,
}));


app.get('/start-sida', (req, res) => {
    const successMessage = req.session.successMessage;
    delete req.session.successMessage; // Ta bort meddelandet efter att det har skickats
    res.render('start-sida.ejs', { title: 'Start sida', successMessage });
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
    var message = req.query.message || null; // Get the message from the query string

    console.log(message); // Log the message to the console

    res.render('leverans.ejs', { title: 'Kundvagn', order: order, message: message }); // Render the leverans page with the order array and message
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
    /// ♪ there that it came from, there will it go, where did you come from, cotton eye joe? ♪ ///
    /// jag hoppas verkligen att någon kommer se och upskatta detta^ och att jag inte bara skriver till the void -sixt ///


}



var account = 123; // Dummy account number

app.post('/confirm', async (req, res) => {

    const order_b = req.body; // Access the order data sent from the client
    console.log('Received order:', order_b);

    console.log("order: " + order); // Log the order array to the console

    if (order_b[2]) { 
 
        var batch = (await db.query('SELECT batch FROM orders ORDER BY batch DESC LIMIT 1')).rows[0]?.batch || 0; // Get the last batch number from the database

        batch++; // Increment the batch number

        console.log(batch); // Log the batch number to the console

        console.log(order_b); // Log the order array to the console
        
        for (let i = 2; i < order.length; i++) {
            await db.query('INSERT INTO orders (food, price_per, ammount, account, batch) VALUES ($1, $2, $3, $4, $5)', [order_b[i].name, order_b[i].price, order_b[i].amount, account, batch]);
        };

        // res.json({ success: true, message: 'Order confirmed successfully!' });


        
        order = []; // Clear the order array after inserting into the database
        order.push({payment: 0}); // Initialize the order array with a payment object
        order.push({cost: 0, delivery: 0, tax: 0}); // Initialize the order array with a payment object
        
        // console.log(batch); // Log the batch number to the console
        
        // res.redirect('/leverans?message=Beställning+bekräftad'); // Redirect to the delivery page with a success message

    }
    // else {

    //     // res.status(400).json({ success: false, message: 'No items to confirm.' });

    //     console.error('Ingen mat att beställa'); // Log any errors to the console

    //     res.redirect('/leverans?message=Ingen+mat+IDIOT'); // Redirect to the delivery page with an error message
    // }

});






// Hantera login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kontrollera om användaren finns i databasen
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Spara användarens ID i sessionen
            req.session.userId = user.id;

            // Lägg till ett meddelande i sessionen
            req.session.successMessage = 'Inloggning lyckades!';

            // Omdirigera till start-sida
            res.redirect('/start-sida');
        } else {
            res.status(401).send('<script>alert("Felaktigt användarnamn eller lösenord."); window.location.href="/login";</script>');
        }
    } catch (error) {
        console.error('Fel vid inloggning:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid inloggning."); window.location.href="/login";</script>');
    }
});



// Hantera registrering
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).send('<script>alert("Alla fält måste fyllas i."); window.location.href="/registrera";</script>');
        }

        // Hasha lösenordet
        const hashedPassword = await bcrypt.hash(password, 10);

        // Spara användaren i databasen
        const result = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        // Spara användarens ID i sessionen
        const userId = result.rows[0].id;
        req.session.userId = userId;

        // Lägg till ett meddelande i sessionen
        req.session.successMessage = 'Registrering lyckades!';

        // Omdirigera till start-sida
        res.redirect('/start-sida');
    } catch (error) {
        console.error('Fel vid registrering:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid registrering."); window.location.href="/registrera";</script>');
    }
});

// Logga ut användaren
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Fel vid utloggning:', err);
            return res.status(500).send('Ett fel uppstod vid utloggning.');
        }
        res.redirect('/login');
    });
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