import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const baseURL =
  "https://opentdb.com/api.php?amount=20&category=27&difficulty=medium&type=multiple";

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


// 🔹 Shuffle helper function (Fisher–Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get("/", async (req, res) => {
  try {
    const result = await axios.get(baseURL);

    const processedData = result.data.results.map((item) => {
      // Combine correct + incorrect answers
      const options = shuffle([...item.incorrect_answers, item.correct_answer]);

      return {
        ...item, // keep original fields (question, category, etc.)
        options, // add shuffled options
      };
    });

    console.log(processedData[0]);

    res.render("index.ejs", { content: processedData });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

app.post("/submit-answers", (req, res)=>{
  console.log(req.body);
  const answers = req.body;
})

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
