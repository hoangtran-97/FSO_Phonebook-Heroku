require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3001;
const Person = require("./models/person");
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(morgan(":type"));
app.use(express.static("build"));
morgan.token("type", function(req, res) {
    return JSON.stringify(req.body);
});
let persons = [
    {
        name: "Arto Hellas",
        number: "1234",
        id: 1,
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2,
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3,
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4,
    },
];
const generateId = () => {
    return Math.floor(Math.random() * Math.floor(200));
};
//All Mongo
app.get("/api/persons", (req, res) => {
    Person.find({}).then((persons) => {
        res.json(persons);
    });
});
//Info Mongo
app.get("/info", (req, res) => {
    Person.find({}).then((persons) => {
        const today = new Date();
        res.send(`<p>Phonebook has info for ${persons.length} persons.</p>
            <p>${today}</p>
                `);
    });
});
//by ID Mongo
app.get("/api/persons/:id", (request, response) => {
    Person.findById(request.params.id).then((person) => {
        if (person) {
            response.json(person);
        } else {
            response.status(404).end();
        }
    });
});
//Delete
app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});
//Post Mongo
app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name) {
        return response.status(400).json({
            error: "name is missing",
        });
    }
    if (!body.number) {
        return response.status(400).json({
            error: "number is missing",
        });
    }
    const checkPerson = persons.find((person) => person.name === body.name);
    if (checkPerson) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }
    //OLD way
    // const person = {
    //     name: body.name,
    //     number: body.number,
    //     id: generateId(),
    // };

    // persons = persons.concat(person);

    // response.json(person);

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    });
    person.save().then((savedPerson) => {
        response.json(savedPerson);
    });
});
//Put Mongo
app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body;

    const person = {
        number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then((updatedPerson) => {
            response.json(updatedPerson);
        })
        .catch((error) => next(error));
});
const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({error: "malformatted id"});
    }

    next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
