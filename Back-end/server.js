import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import session from 'express-session';

const app = express();
const port = 3000;

const db = new pg.Client({
   connectionString: process.env.DATABASE_URL,
   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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

app.get('/Matleverans-Sida/nimdA', async (req, res) => {
       // Query each table
       const data_delivery = await db.query('SELECT * FROM delivery');
       const data_orders = await db.query('SELECT * FROM orders');
       const data_users = await db.query('SELECT * FROM users');

       // Combine all data into one object
       const all = {
           delivery: data_delivery.rows,
           orders: data_orders.rows,
           users: data_users.rows
       };

       // Pass it to the EJS view
       res.render('Admin.ejs', { all: all });
})


app.get('/Matleverans-Sida/', (req, res) => {
    res.redirect('/Matleverans-Sida/start-sida')
});


app.use((req, res, next) => {
    res.locals.username = req.session.username || null; // Skicka användarnamnet om det finns, annars null
    next();
});

app.get('/Matleverans-Sida/start-sida', (req, res) => {
    const successMessage = req.session.successMessage;
    const username = req.session.username; // Hämta användarnamnet från sessionen
    delete req.session.successMessage; // Ta bort meddelandet efter att det har skickats
    res.render('start-sida.ejs', { title: 'Start sida', successMessage, username });
});



app.get('/Matleverans-Sida/om-oss', (req, res) => {
    res.render('om-oss.ejs', { title: 'Start sida' });
});

app.get('/Matleverans-Sida/login', (req, res) => {
    res.render('konto.ejs', { title: 'Konto sida' });
});

app.get('/Matleverans-Sida/beskrivningar', (req, res) => {
    res.render('beskrivningar.ejs', { title: 'Menyerna' });
});

app.get('/Matleverans-Sida/registrera', (req, res) => {
    res.render('registrera.ejs', { title: 'Registrera' });
});

app.get('/Matleverans-Sida/Abracadabra/abra-cadabra', (req, res) => {
    res.render('Abracadabra/abra-cadabra.ejs');
});

app.get('/Matleverans-Sida/Abracadabra/brisket-platter', (req, res) => {
    res.render('Abracadabra/Maträtt-brisket-platter.ejs');
});

app.get('/Matleverans-Sida/Abracadabra/kyckling', (req, res) => {
    res.render('Abracadabra/Maträtt-kyckling.ejs');
});

app.get('/Matleverans-Sida/Abracadabra/ribs', (req, res) => {
    res.render('Abracadabra/Maträtt-ribs.ejs');
});

app.get('/Matleverans-Sida/Agatas/agatas', (req, res) => {
    res.render('Agatas/agatas.ejs');
});

app.get('/Matleverans-Sida/Agatas/avocado-toast', (req, res) => {
    res.render('Agatas/Maträtt-avocado-toast.ejs');
});

app.get('/Matleverans-Sida/Agatas/choklad-pudding', (req, res) => {
    res.render('Agatas/Maträtt-choklad-pudding.ejs');
});

app.get('/Matleverans-Sida/Agatas/soppa', (req, res) => {
    res.render('Agatas/Maträtt-räk-soppa.ejs');
});

app.get('/Matleverans-Sida/Pretantieuse/pretentieuse', (req, res) => {
    res.render('Pretantieuse/pretentieuse.ejs');
});

app.get('/Matleverans-Sida/Pretantieuse/moln', (req, res) => {
    res.render('Pretantieuse/Maträtt-moln.ejs');
});

app.get('/Matleverans-Sida/Pretantieuse/centaur', (req, res) => {
    res.render('Pretantieuse/Maträtt-centaur.ejs');
});

app.get('/Matleverans-Sida/Pretantieuse/slag', (req, res) => {
    res.render('Pretantieuse/Maträtt-slag.ejs');
});

var order = [];
order.push({payment: 0}); // Initialize the order array with a payment object
order.push({cost: 0, delivery: 0, tax: 0}); // Initialize the order array with a payment object


app.get('/Matleverans-Sida/leverans', requireLogin, async (req, res) => {
    try {
        // Hämta adress från databasen
        const result = await db.query('SELECT address FROM users WHERE id = $1', [req.session.userId]);
        const address = result.rows[0]?.address || ''; // Om ingen adress finns, använd en tom sträng

        // try{
            const result_b = await db.query('SELECT address FROM delivery WHERE account = $1 ORDER BY batch DESC LIMIT 1', [req.session.userId]); // Get the last batch number from the database
            const address_senast = result_b.rows[0]?.address; // Get the last batch number from the database
        // } catch(err) {console.log('/Matleverans-Sida/leverans error:', err)}

        // var address_senast = 123
        
        // Skicka adressen till vyn
        res.render('leverans.ejs', { 
            title: 'Kundvagn', 
            order: order, 
            message: req.query.message || null, 
            address: address, // Skicka adressen till leverans.ejs
            address_senast: address_senast
        });
    } catch (error) {
        console.error('Fel vid hämtning av adress:', error);
        res.status(500).send('Ett fel uppstod vid hämtning av adress.');
    }
});
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/Matleverans-Sida/login');
    }
    next();
}

///          Funktion som hanterar beställningar         ///
///          och lägger till dem i en array           ///
///          och uppdaterar totalsumman               ///
app.get('/Matleverans-Sida/anvandare', requireLogin, async (req, res) => {
    try {
        const result = await db.query('SELECT username, email, phone, address FROM users WHERE id = $1', [req.session.userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).send('Användare hittades inte.');
        }

        const successMessage = req.session.successMessage;
        delete req.session.successMessage; // Ta bort meddelandet efter att det har skickats

        res.render('användare.ejs', {
            username: user.username,
            email: user.email,
            phone: user.phone, // Skicka telefonnumret till vyn
            address: user.address || 'Ingen adress angiven', // Skicka adressen till vyn
            userId: req.session.userId,
            successMessage
        });
    } catch (error) {
        console.error('Fel vid hämtning av användarinformation:', error);
        res.status(500).send('Ett fel uppstod vid hämtning av användarinformation.');
    }
});
app.get('/Matleverans-Sida/destination', requireLogin, async (req, res) => {
    try {
        // Hämta adress från databasen
        const result = await db.query('SELECT address FROM users WHERE id = $1', [req.session.userId]);
        const address = result.rows[0]?.address || ''; // Om ingen adress finns, använd en tom sträng        

        // try{
        //     const address_senast = await db.query('SELECT address FROM delivery WHERE account = $1 ORDER BY batch DESC LIMIT 1', [req.session.userId] ).rows[0]?.address; // Get the last batch number from the database
        //     console.log('/Matleverans-Sida/destination address_senast:', address_senast)
        // } catch(err) {console.log('/Matleverans-Sida/destination error:', err)}

        // Skicka adressen till vyn
        res.render('destination.ejs', {
            address: address,
            // address_senast: address_senast,
        });
    } catch (error) {
        console.error('Fel vid hämtning av adress:', error);
        res.status(500).send('Ett fel uppstod vid hämtning av adress.');
    }
});
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



var account = null; // Dummy account number

app.post('/Matleverans-Sida/confirm', async (req, res) => {

    const data_transport_b = req.body; // Access the order data sent from the client

    // if (data_transport_b.exter){
    var exter = data_transport_b.exter
    // }
    
    var gata_b = data_transport_b.gata
    
    var betalnings_sätt = data_transport_b.betalning

    console.log('gata', gata_b)
    console.log('payment', betalnings_sätt)

    var order_b = data_transport_b.order_b
    console.log('Received order:', order_b);

    console.log("order: " + order); // Log the order array to the console

    account = req.session.userId

    if (order_b[2]) { 
 
        var batch = (await db.query('SELECT batch FROM orders ORDER BY batch DESC LIMIT 1')).rows[0]?.batch || 0; // Get the last batch number from the database

        batch++; // Increment the batch number

        console.log(batch); // Log the batch number to the console

        console.log(order_b); // Log the order array to the console
        
        for (let i = 2; i < order_b.length; i++) {
            await db.query('INSERT INTO orders (food, price_per, ammount, account, batch) VALUES ($1, $2, $3, $4, $5)', [order_b[i].name, order_b[i].price, order_b[i].amount, account, batch]);
        };
        
        await db.query('INSERT INTO delivery (address, payment, account, batch, extra_instructions) VALUES ($1, $2, $3, $4, $5)', [gata_b, betalnings_sätt, account, batch, exter]);
        // res.json({ success: true, message: 'Order confirmed successfully!' });




    
        order = []; // Clear the order array after inserting into the database
        order.push({payment: 0}); // Initialize the order array with a payment object
        order.push({cost: 0, delivery: 0, tax: 0}); // Initialize the order array with a payment object
        
        // console.log(batch); // Log the batch number to the console
        
        // res.redirect('/Matleverans-Sida/leverans?message=Beställning+bekräftad'); // Redirect to the delivery page with a success message

    }
    // else {

    //     // res.status(400).json({ success: false, message: 'No items to confirm.' });

    //     console.error('Ingen mat att beställa'); // Log any errors to the console

    //     res.redirect('/Matleverans-Sida/leverans?message=Ingen+mat+IDIOT'); // Redirect to the delivery page with an error message
    // }

});





// Hantera login
app.post('/Matleverans-Sida/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kontrollera om användaren finns i databasen
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Spara användarens ID och användarnamn i sessionen
            req.session.userId = user.id;
            req.session.username = user.username;

            // Lägg till ett meddelande i sessionen
            req.session.successMessage = 'Inloggning lyckades!';

            // Omdirigera till start-sida
            res.redirect('/Matleverans-Sida/start-sida');
        } else {
            res.status(401).send('<script>alert("Felaktigt användarnamn eller lösenord."); window.location.href="Matleverans-Sida/login";</script>');
        }
    } catch (error) {
        console.error('Fel vid inloggning:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid inloggning."); window.location.href="Matleverans-Sida/login";</script>');
    }
});


app.post('/Matleverans-Sida/register', async (req, res) => {
    const { username, email, phone, password, address } = req.body;

    try {
        if (!username || !email || !phone || !password || !address) {
            return res.status(400).send('<script>alert("Alla fält måste fyllas i."); window.location.href="Matleverans-Sida/registrera";</script>');
        }

        // Hasha lösenordet
        const hashedPassword = await bcrypt.hash(password, 10);

        // Spara användaren i databasen
        const result = await db.query(
            'INSERT INTO users (username, email, phone, password, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, email, phone, hashedPassword, address]
        );

        // Spara användarens ID och användarnamn i sessionen
        const userId = result.rows[0].id;
        req.session.userId = userId;
        req.session.username = username;

        // Lägg till ett meddelande i sessionen
        req.session.successMessage = 'Registrering lyckades! Du är nu inloggad.';

        // Omdirigera till start-sida
        res.redirect('/Matleverans-Sida/start-sida');
    } catch (error) {
        console.error('Fel vid registrering:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid registrering."); window.location.href="Matleverans-Sida/registrera";</script>');
    }
});

// Logga ut användaren
app.post('/Matleverans-Sida/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Fel vid utloggning:', err);
            return res.status(500).send('Ett fel uppstod vid utloggning.');
        }
        res.redirect('/Matleverans-Sida/start-sida');
    });
});
app.post('/Matleverans-Sida/anvandare/uppdatera-email', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/Matleverans-Sida/login'); // Om användaren inte är inloggad, omdirigera till inloggningssidan
    }

    const { newEmail } = req.body;

    try {
        // Uppdatera e-postadressen i databasen
        await db.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, req.session.userId]);

        // Uppdatera sessionen med den nya e-postadressen
        req.session.successMessage = 'Din e-postadress har uppdaterats!';
        res.redirect('/Matleverans-Sida/anvandare');
    } catch (error) {
        console.error('Fel vid uppdatering av e-postadress:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid uppdatering av e-postadress."); window.location.href="Matleverans-Sida/anvandare";</script>');
    }
});
app.post('/Matleverans-Sida/anvandare/uppdatera-adress', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/Matleverans-Sida/login'); // Om användaren inte är inloggad, omdirigera till inloggningssidan
    }

    const { newAddress } = req.body;

    try {
        // Uppdatera adressen i databasen
        await db.query('UPDATE users SET address = $1 WHERE id = $2', [newAddress, req.session.userId]);

        // Lägg till ett meddelande i sessionen
        req.session.successMessage = 'Din adress har uppdaterats!';
        res.redirect('/Matleverans-Sida/anvandare');
    } catch (error) {
        console.error('Fel vid uppdatering av adress:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid uppdatering av adress."); window.location.href="Matleverans-Sida/anvandare";</script>');
    }
});

app.post('/Matleverans-Sida/buy/Oxbringa', (req, res) => {
    shopping(req, res, 'Oxbringa', 200 )
});

app.post('/Matleverans-Sida/buy/Revben', (req, res) => { 
    shopping(req, res, 'Revben', 350 )
});

app.post('/Matleverans-Sida/buy/Kyckling', (req, res) => { 
    shopping(req, res, 'Kyckling', 150 )
});

app.post('/Matleverans-Sida/buy/AvacadoToast', (req, res) => { 
    shopping(req, res, 'AvacadoToast', 50 )
});

app.post('/Matleverans-Sida/buy/ChockladPudding', (req, res) => { 
    shopping(req, res, 'ChocladPudding', 35 )
});

app.post('/Matleverans-Sida/buy/Soppa', (req, res) => { 
    shopping(req, res, 'RäkSoppa', 60 )
});

app.post('/Matleverans-Sida/buy/Moln', (req, res) => { 
    shopping(req, res, 'Moln', 2000 )
});

app.post('/Matleverans-Sida/buy/Centaur', (req, res) => { 
    shopping(req, res, 'Centaur', 35000 )
});

app.post('/Matleverans-Sida/buy/Slag', (req, res) => { 
    shopping(req, res, 'Slag', 450 )
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});