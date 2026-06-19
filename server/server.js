import app from './index.js';

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));