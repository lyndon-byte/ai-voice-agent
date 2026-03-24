🚀 Try It Live
You can try the platform live: https://talkingtoeleven.com/

👉 Simply register using a valid email address to access the dashboard and explore the features.

# System Overview

This is an AI-powered voice assistant automation platform that uses the ElevenLabs API to enable users to create realistic AI voice agents.

# Built with:

* Backend: Laravel
* Frontend: React (Vite) + Inertia.js
* Database: MySQL / PostgreSQL
* Queue System: Laravel Scheduler (for background jobs)
* AI or voice agent api: ElevenLabs 

# Requirements

Required
PHP >= 8.1
Composer
Node.js >= 18
npm or yarn
MySQL or PostgreSQL

# Setup Instructions (Local Development)
1. Clone the Repository

git clone https://github.com/lyndon-byte/ai-voice-agent.git
cd ai-voice-agent

2. Install PHP Dependencies

composer install

3. Install Frontend Dependencies

npm install

4. Setup Environment File
Copy the example environment file:

cp .env.example .env

5. Configure Environment Variables
Update .env with your local setup:

APP_NAME="Talking to eleven"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=pgsql // or mysql
DB_HOST=127.0.0.1
DB_PORT=5432  // or 3306 if mysql
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
VITE_LANDING_PAGE_AGENT_ID=agent_4501kkrqdkatfbava1w2x980ph8j

6. Generate Application Key:

7. Run Database Migrations:

php artisan migrate \
--path=database/migrations/landlord \
--path=database/migrations

php artisan db:seed --class=RoleSeeder

8. Start Development Servers:
Run Laravel:
php artisan serve
Run Vite (frontend):
npm run dev

9. Run Queue Worker
php artisan queue:work

🌐 Access the App
Open your browser:

http://localhost:8000

🔐 Authentication
Register using a valid email

🛠️ Additional Notes
Make sure your database is running before migration
Queue workers are required for background jobs (emails, automation, etc.)

📦 Additional Requirements

The following services are required for full functionality:
Install ngrok to expose your local server for webhooks.

run on command terminal:
ngrok.exe http 8000

Use this webhook endpoint in your eleven lab post-call webhook:
https://xxxx.ngrok.io/receive-webhook

🤖 ElevenLabs Account

You need an account from ElevenLabs to:

Generate API key
Configure AI voice agents
Set webhook authentication secret

The webhook secret can be generated inside the ElevenLabs agent settings (used for post-call webhook verification).

📞 Twilio Account

You need an account from Twilio for:

Voice call handling
Phone number provisioning
Authentication (SID and Auth Token)

📧 Mailer Service

Use a mail provider such as:

Mailgun
Mailtrap

⚙️ Environment Variables

Update your .env file with the following:

MAIL_MAILER=smtp
MAIL_HOST=your-mail-host
MAIL_PORT=465
MAIL_USERNAME=your-mail-username
MAIL_PASSWORD=your-mail-password
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=your-email@example.com
MAIL_FROM_NAME="${APP_NAME}"

ELEVEN_LABS_KEY=your-elevenlabs-api-key
ELEVEN_LABS_WEBHOOK_AUTH_SECRET_KEY=your-webhook-secret-key

TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

📁 Project Structure (Simplified)
app/            # Laravel backend logic
resources/js/   # React frontend (Inertia)
routes/         # Web routes
database/       # Migrations and seeders
public/         # Public assets
