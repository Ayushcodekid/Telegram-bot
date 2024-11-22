require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const User = require("./models/user");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ chatId });

  if (!user) {
    await new User({ chatId }).save();
    bot.sendMessage(chatId, "Welcome! Use /subscribe to get weather updates.");
  } else {
    bot.sendMessage(chatId, "Welcome back! Use /subscribe to manage your subscription.");
  }
});

// Subscribe command
// Subscribe command
bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ chatId });

  if (user) {
    user.subscribed = true; // Ensure the user is subscribed
    await user.save();

    const message = "You are now subscribed to weather updates!";
    bot.sendMessage(chatId, message);
  } else {
    bot.sendMessage(chatId, "Please use /start first to initialize your account.");
  }
});

// Unsubscribe command
bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ chatId });

  if (user) {
    user.subscribed = false; // Ensure the user is unsubscribed
    await user.save();

    const message = "You have unsubscribed from weather updates.";
    bot.sendMessage(chatId, message);
  } else {
    bot.sendMessage(chatId, "Please use /start first to initialize your account.");
  }
});


// Weather update
const fetchWeather = async (location = "Bengaluru") => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
  );
  const data = await response.json();

  if (data.cod === 200) {
    return {
      description: data.weather[0].description,
      temperature: `${data.main.temp}°C`,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      location: data.name,
    };
  }
  return null;
};

// Weather command
bot.onText(/\/weather (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const location = match[1];
  const weather = await fetchWeather(location);

  if (weather) {
    bot.sendMessage(chatId, `Weather in ${weather.location}:
- Description: ${weather.description}
- Temperature: ${weather.temperature}`);
  } else {
    bot.sendMessage(chatId, "Error fetching weather data. Please try again.");
  }
});

// Sunrise command
bot.onText(/\/sunrise (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const location = match[1];
  const weather = await fetchWeather(location);

  if (weather) {
    bot.sendMessage(chatId, `In ${weather.location}:
- Sunrise: ${weather.sunrise}
- Sunset: ${weather.sunset}`);
  } else {
    bot.sendMessage(chatId, "Error fetching sunrise/sunset data. Please try again.");
  }
});



bot.onText(/\/compare (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city1 = match[1];
  const city2 = match[2];

  const weather1 = await fetchWeather(city1);
  const weather2 = await fetchWeather(city2);

  if (weather1 && weather2) {
    const comparison = `Weather Comparison:\n\n${city1}:
- Description: ${weather1.description}
- Temperature: ${weather1.temperature}
- Sunrise: ${weather1.sunrise}
- Sunset: ${weather1.sunset}

${city2}:
- Description: ${weather2.description}
- Temperature: ${weather2.temperature}
- Sunrise: ${weather2.sunrise}
- Sunset: ${weather2.sunset}`;

    bot.sendMessage(chatId, comparison);
  } else {
    bot.sendMessage(chatId, "Error fetching weather data for one or both cities. Please try again.");
  }
});



// Broadcast updates
const sendWeatherUpdates = async () => {
  const subscribedUsers = await User.find({ subscribed: true });

  subscribedUsers.forEach(async (user) => {
    const weather = await fetchWeather();
    if (weather) {
      bot.sendMessage(user.chatId, `Weather in ${weather.location}:
- Description: ${weather.description}
- Temperature: ${weather.temperature}`);
    }
  });
};

// Schedule updates every hour
setInterval(sendWeatherUpdates, 60000);
