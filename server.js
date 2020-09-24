const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51HTvCaChrB4Xa688IOPJkkyHPAbnxwRmhqGvLxoXjLyPk1NztmRmib5yVnh5r6mZ2UfRhRMsDTxFRvuNbKYvFxra00Wcd2JZ7w");
// const uuid = require("uuid/v4");
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

// app.get("/", (req, res) => {
//     res.send("Running");
// });

app.post("/checkout", async (req, res) => {
    console.log("Request:", req.body);
    let error;
    let status;
    try {
        const { token } = req.body;

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const idempotency_key = uuidv4();
        const charge = await stripe.charges.create(
            {
                amount: req.body.price,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${req.body.name}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address_city,
                        country: token.card.address_country,
                        postal_code: token.card.address_zip
                    }
                }
            },
            {
                idempotency_key
            }
        );
        console.log("Charge:", { charge });
        status = "success";
    } catch (error) {
        console.error("Error:", error);
        status = "failure";
    }

    res.json({ error, status });
});

app.listen(5000);
