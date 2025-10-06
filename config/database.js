const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/healthadmin', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
        console.error('❌ Error al conectar MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;