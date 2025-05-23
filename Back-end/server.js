import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import session from 'express-session';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;


/// kopplar upp till databasen ///
const db = new pg.Client({
   connectionString: process.env.DATABASE_URL,
   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // user: process.env.DB_USER,
    // host: process.env.DB_HOST,
    // database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
    // password: process.env.DB_PASSWORD,
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

app.get('/nimdA', async (req, res) => {
       // Query each table
       const data_delivery = await db.query('SELECT * FROM delivery ORDER BY id');
       const data_orders = await db.query('SELECT * FROM orders ORDER BY id');
       const data_users = await db.query('SELECT * FROM users ORDER BY id');

       // Combine all data into one object
       const all = {
           delivery: data_delivery.rows,
           orders: data_orders.rows,
           users: data_users.rows
       };

       // Pass it to the EJS view
       res.render('admin.ejs', { all: all });
})

app.post('/nimdA/edit/row', async (req, res) => {
    /// ta emot data från front-end ///
    var table_name = req.body.table_name
    var data = req.body.data
    console.log('table_name:', table_name)
    console.dir(data, {depth: null})

    console.log(Object.keys(data))
    console.log(Object.values(data))
    
    for (let i = 0; i < Object.keys(data).length; i++) {
        let nyckel = Object.keys(data)[i]
        let värde = Object.values(data)[i]
        db.query(`UPDATE ${table_name} SET ${nyckel} = $1 WHERE id = $2`, [värde, data.id])
    }
})

/// Skickar till start sidan från root ///
app.get('/', (req, res) => {
    res.redirect('/start-sida')
});


app.use((req, res, next) => {
    res.locals.username = req.session.username || null; // Skicka användarnamnet om det finns, annars null
    next();
});

app.get('/start-sida', (req, res) => {
    const successMessage = req.session.successMessage;
    const username = req.session.username; // Hämta användarnamnet från sessionen
    delete req.session.successMessage; // Ta bort meddelandet efter att det har skickats
    res.render('start-sida.ejs', { title: 'Start sida', successMessage, username });
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


/// Skapar en tom array för att lagra beställningar ///
var order = [];
/// lägger till en tom betalning och kostnad i arrayen ///
order.push({payment: 0}); // Initialize the order array with a payment object
order.push({cost: 0, delivery: 0, tax: 0}); // Initialize the order array with a payment object


app.get('/leverans', requireLogin, async (req, res) => {
    try {
        // Hämta adress från databasen
        const result = await db.query('SELECT address FROM users WHERE id = $1', [req.session.userId]);
        const address = result.rows[0]?.address || ''; // Om ingen adress finns, använd en tom sträng

        // try{
            const result_b = await db.query('SELECT address FROM delivery WHERE account = $1 ORDER BY batch DESC LIMIT 1', [req.session.userId]); // Get the last batch number from the database
            const address_senast = result_b.rows[0]?.address; // Get the last batch number from the database
        // } catch(err) {console.log('/leverans error:', err)}

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
        return res.redirect('/login');
    }
    next();
}


// Middleware för att kontrollera adminåtkomst
function requireAdmin(req, res, next) {
    if (req.session.role === 'admin') {
        next(); // Fortsätt om användaren är admin
    } else {
        res.status(403).send('<script>alert("Åtkomst nekad: Endast administratörer har åtkomst."); window.location.href="/";</script>');
    }
}

// Skydda adminsidan med requireAdmin
app.get('/nimdA', requireAdmin, async (req, res) => {
    try {
        // Hämta data från databasen
        const data_delivery = await db.query('SELECT * FROM delivery');
        const data_orders = await db.query('SELECT * FROM orders');
        const data_users = await db.query('SELECT * FROM users');

        // Kombinera all data i ett objekt
        const all = {
            delivery: data_delivery.rows,
            orders: data_orders.rows,
            users: data_users.rows
        };

        // Skicka datan till admin.ejs
        res.render('admin.ejs', { all: all });
    } catch (error) {
        console.error('Fel vid hämtning av admininformation:', error);
        res.status(500).send('Ett fel uppstod vid hämtning av admininformation.');
    }
});

///          Funktion som hanterar beställningar         ///
///          och lägger till dem i en array           ///
///          och uppdaterar totalsumman               ///
app.get('/anvandare', requireLogin, async (req, res) => {
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
app.get('/destination', requireLogin, async (req, res) => {
    try {
        // Hämta adress från databasen
        const result = await db.query('SELECT address FROM users WHERE id = $1', [req.session.userId]);
        const address = result.rows[0]?.address || ''; // Om ingen adress finns, använd en tom sträng        

        // try{
        //     const address_senast = await db.query('SELECT address FROM delivery WHERE account = $1 ORDER BY batch DESC LIMIT 1', [req.session.userId] ).rows[0]?.address; // Get the last batch number from the database
        //     console.log('/destination address_senast:', address_senast)
        // } catch(err) {console.log('/destination error:', err)}

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

/// funktion som hanterar beställningar ///
/// och lägger till dem i en array ///
function shopping(req, res, name, price, addition=1,) {

    const existingItem = order.find( (item) => item.name === name); // Find the item in the array

    if (existingItem) {
        existingItem.amount += addition; // Increment the amount if the item exists
        existingItem.total = existingItem.price * existingItem.amount; // Update the total price
    } 
    else {
        order.push({ name: name, price: price, amount: 1, total: price }); // Add a new item if it doesn't exist
    }

    /// nolla ///
    
    var cost = 0;

    order[0].payment = 0;

    /// lägg in värder från alla objekt i arrayen ///
    /// och räkna ut totalsumman ///
    for (let i = 2; i < order.length; i++) {
        cost += order[i].total; // Calculate the total payment
    };


    /// uppdatera totalsumman ///
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



var account = null;

app.post('/confirm', async (req, res) => {


    /// ta imot data transporterat från front-end ///
    /// och spara det i en variabel ///
    const data_transport_b = req.body; // Access the order data sent from the client

    // if (data_transport_b.exter){

    /// extra instyruktioner: ///
    var exter = data_transport_b.exter
    // }
    /// adress: ///
    var gata_b = data_transport_b.gata
    /// betalning: ///
    var betalnings_sätt = data_transport_b.betalning

    console.log('gata', gata_b)
    console.log('payment', betalnings_sätt)

    var order_b = data_transport_b.order_b
    console.log('Received order:', order_b);

    console.log("order: " + order); // Log the order array to the console

    account = req.session.userId

    /// om det finns någon mat i order_b arrayen ///

    if (order_b[2]) { 
        
        /// kolla viket värde tidigare såkallad batch hade ///
        var batch = (await db.query('SELECT batch FROM orders ORDER BY batch DESC LIMIT 1')).rows[0]?.batch || 0; // Get the last batch number from the database

        /// lägg till 1 till batch ///
        batch++; // Increment the batch number

        /// (batch är vilket "paket" beställningen är i) ///

        console.log(batch); // Log the batch number to the console

        console.log(order_b); // Log the order array to the console

        /// lägg till beställningen i databasen ///
        
        for (let i = 2; i < order_b.length; i++) {
            await db.query('INSERT INTO orders (food, price_per, ammount, account, batch) VALUES ($1, $2, $3, $4, $5)', [order_b[i].name, order_b[i].price, order_b[i].amount, account, batch]);
        };
        
        await db.query('INSERT INTO delivery (address, payment, account, batch, extra_instructions) VALUES ($1, $2, $3, $4, $5)', [gata_b, betalnings_sätt, account, batch, exter]);
        // res.json({ success: true, message: 'Order confirmed successfully!' });




        /// nolla order arrayen ///
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



app.post('/nimdA/delete/row', async (req, res) => {

    /// ta bort en rad i databasen ///

    const { table_name, id } = req.body;
    
    await db.query(`DELETE FROM ${table_name} WHERE id = $1`, [id]);
})


// Hantera login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.role = user.role; // Spara rollen i sessionen

            if (user.role === 'admin') {
                res.redirect('/nimdA'); // Omdirigera till adminsidan
            } else {
                res.redirect('/start-sida'); // Omdirigera till användarsidan
            }
        } else {
            res.status(401).send('<script>alert("Felaktigt användarnamn eller lösenord."); window.location.href="/login";</script>');
        }
    } catch (error) {
        console.error('Fel vid inloggning:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid inloggning."); window.location.href="/login";</script>');
    }
});

app.post('/register', async (req, res) => {
    const { username, email, phone, password, address, role } = req.body;

    try {
        if (!username || !email || !phone || !password || !address) {
            return res.status(400).send('<script>alert("Alla fält måste fyllas i."); window.location.href="/registrera";</script>');
        }

        // Hasha lösenordet
        const hashedPassword = await bcrypt.hash(password, 10);

        // Sätt rollen till 'user' som standard om ingen roll anges
        const userRole = role || 'user';

        // Spara användaren i databasen
        const result = await db.query(
            'INSERT INTO users (username, email, phone, password, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [username, email, phone, hashedPassword, address, userRole]
        );

        // Spara användarens ID och användarnamn i sessionen
        const userId = result.rows[0].id;
        req.session.userId = userId;
        req.session.username = username;
        req.session.role = userRole; // Spara rollen i sessionen

        // Lägg till ett meddelande i sessionen
        req.session.successMessage = 'Registrering lyckades! Du är nu inloggad.';

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
        res.redirect('/start-sida');
    });
});
app.post('/anvandare/uppdatera-email', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggningssidan
    }

    const { newEmail } = req.body;

    try {
        // Uppdatera e-postadressen i databasen
        await db.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, req.session.userId]);

        // Uppdatera sessionen med den nya e-postadressen
        req.session.successMessage = 'Din e-postadress har uppdaterats!';
        res.redirect('/anvandare');
    } catch (error) {
        console.error('Fel vid uppdatering av e-postadress:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid uppdatering av e-postadress."); window.location.href="/anvandare";</script>');
    }
});
app.post('/anvandare/uppdatera-adress', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggningssidan
    }

    const { newAddress } = req.body;

    try {
        // Uppdatera adressen i databasen
        await db.query('UPDATE users SET address = $1 WHERE id = $2', [newAddress, req.session.userId]);

        // Lägg till ett meddelande i sessionen
        req.session.successMessage = 'Din adress har uppdaterats!';
        res.redirect('/anvandare');
    } catch (error) {
        console.error('Fel vid uppdatering av adress:', error);
        res.status(500).send('<script>alert("Ett fel uppstod vid uppdatering av adress."); window.location.href="/anvandare";</script>');
    }
});

/// aktiveras när du klickar på köp knappen ///

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

/// kolla att det funkar: ///

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});