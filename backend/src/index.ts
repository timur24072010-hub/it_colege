import createApi from "./createApi";

const app = createApi();

app.get("/test", (req, res) => {
  res.send("Тестовый роут работает!");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});