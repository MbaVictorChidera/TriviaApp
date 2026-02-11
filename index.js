import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();
const port = process.env.PORT||3000;
const baseURL =
    "https://opentdb.com/api.php?amount=30&category=27&difficulty=medium&type=multiple";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret:"trivia-secret-key",
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static("public"));


// 🔹 Shuffle helper function (Fisher–Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


app.get("/", async(req, res) => {
    try {
        const result = await axios.get(baseURL);

        const questions = result.data.results.map((item) => {
            // Combine correct + incorrect answers
            const options = shuffle([...item.incorrect_answers, item.correct_answer]);

            return {
                ...item, // keep original fields (question, category, etc.)
                options, // add shuffled options
            };
        });

        // console.log(question[0]);
        req.session.questions = questions;

        res.render("index.ejs", { content: questions });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.post("/submit-answers", (req, res) => {
    // console.log(req.body);
    if (!questions) {
    return res.redirect("/");
    }
    const userAnswers = req.body;
    const questions = req.session.questions;

    let score = 0;

    questions.forEach((item, index) => {
        const userAnswer = userAnswers[`q${index}`];
        if (userAnswer === item.correct_answer) {
            // console.log("correct answer");
            score++;
        }
    });

    const percentage = (score / questions.length) * 100;
    let grade = "";
    let comment = "";
    let colorCode = "";

    if (percentage <= 39) {
        grade = "F";
        comment = " Fail, Better luck next time ";
        colorCode = "#e60101";
    } else if (percentage <= 49 ) {
        grade = "E";
        comment = " You can do better next time";
        colorCode = "#f77d03ff";
    } else if (percentage <= 59 ) {
        grade = "D";
        comment = "Nice try ";
        colorCode = "#f7ae03ff";
    } else if (percentage <= 69 ) {
        grade = "C";
        comment = "Good";
        colorCode = "#D3F16D";
    } else if (percentage <= 79 ) {
        grade = "B";
        comment = "Very Good";
        colorCode = "#03f70b";
    } else if (percentage <= 100) {
        grade = "A";
        comment = "Excellent";
        colorCode = "#10b315ff";
    } else {
        grade = "No grade Yet";
        comment = "Take test First";
        colorCode = "#000";
    }

    res.render("submit.ejs", {
        answers: userAnswers,
        score: score,
        total: questions.length,
        percentage: percentage,
        question: questions,
        grade: grade,
        comment: comment,
        colorCode: colorCode,
    });
});

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});


