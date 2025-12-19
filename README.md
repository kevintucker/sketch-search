# Sales Negotiation Assistant

A powerful web application for sales representatives to manage long-running deal negotiations with AI assistance. The app tracks deal history, conversations, and uses MemMachine's persistent episodic memory to maintain context across weeks/months of negotiations.

## 🚀 Features

### Core Functionality
- **Deal Management**: Create and track multiple sales deals
- **Deal Timeline**: Chronological view of all notes, emails, call summaries, and chat history
- **AI Chat Assistant**: Memory-powered chat that remembers the entire negotiation history
- **Deal Insights**: Memory-backed analysis including concessions ledger, objections log, and buyer tone analysis

### Memory-Backed Intelligence
- **Concessions Ledger**: Track what was given, when, and under what conditions
- **Objections Log**: Record buyer objections and what responses worked/failed
- **Buyer Tone Trend**: Simple labels showing tone evolution over time
- **Contextual AI Responses**: AI assistant references historical data for informed guidance

### Technical Features
- **Persistent Memory**: Uses MemMachine SDK for long-term episodic memory storage
- **Real-time Chat**: Integrated with OpenAI for intelligent responses
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Secure Authentication**: Supabase-powered user authentication and data protection

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Supabase (Authentication + Database)
- **AI Integration**: OpenAI API for chat completions
- **Memory System**: MemMachine SDK for persistent episodic memory
- **State Management**: React Context + localStorage
- **Icons**: Heroicons for consistent UI

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account and project
- OpenAI API key
- MemMachine API key (optional - demo mode available)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd sales-negotiation-assistant
npm install
```

### 2. Environment Setup
Copy the example environment file and configure your keys:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration  
VITE_OPENAI_API_KEY=your_openai_api_key

# MemMachine Configuration (optional)
VITE_MEMMACHINE_API_KEY=your_memmachine_api_key
```

### 3. Database Setup
Apply the database migration to your Supabase project:

```bash
# The migration file is located at:
supabase/migrations/001_initial_schema.sql
```

Or manually create the tables using the SQL provided in the migration file.

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application running.

## 📖 How to Use

### Getting Started
1. **Register**: Create a new account or sign in
2. **Create Deal**: Click "New Deal" and enter company details
3. **Add Timeline Entries**: Record emails, notes, call summaries
4. **Chat with AI**: Get memory-backed negotiation advice
5. **View Insights**: Analyze concessions, objections, and buyer tone

### AI Assistant Features
The AI assistant can help with:
- **Concession Analysis**: "What concessions have we made so far?"
- **Objection Tracking**: "What objections has the buyer raised?"
- **Tone Analysis**: "How has the buyer's tone changed over time?"
- **Strategy Advice**: "What's our negotiation strategy based on the history?"

### Memory System
The MemMachine integration provides:
- **Persistent Context**: Remembers all deal interactions across sessions
- **Pattern Recognition**: Identifies concessions, objections, and tone changes
- **Contextual Responses**: AI responses informed by entire negotiation history
- **Long-term Memory**: Maintains context across weeks and months

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main app layout with navigation
├── pages/              # Page components
│   ├── Login.tsx       # User authentication
│   ├── Register.tsx    # User registration
│   ├── Dashboard.tsx   # Deals overview
│   ├── CreateDeal.tsx  # New deal creation
│   ├── Timeline.tsx    # Deal history timeline
│   ├── Chat.tsx        # AI chat interface
│   └── Insights.tsx    # Deal analysis and insights
├── lib/                # Utility libraries
│   ├── supabase.ts     # Database types and client
│   ├── auth.ts         # Authentication functions
│   ├── deals.ts        # Deal management functions
│   ├── memmachine.ts   # Memory system integration
│   └── openai.ts       # AI chat integration
└── App.tsx             # Main application component

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Copy your project URL and anon key
3. Apply the database migration
4. Enable Row Level Security (RLS) policies

### OpenAI Setup
1. Get an API key from OpenAI
2. Add to your `.env` file
3. The app will use GPT-3.5-turbo for chat completions

### MemMachine Setup (Optional)
1. Get an API key from MemMachine
2. Add to your `.env` file
3. If not provided, the app uses localStorage for demo purposes

## 🧪 Testing

Run the development server and test the following:

1. **User Registration/Login**: Create account and sign in
2. **Deal Creation**: Create a new deal with company details
3. **Timeline Management**: Add various types of entries
4. **AI Chat**: Ask questions about the deal history
5. **Insights View**: Check concessions, objections, and tone analysis
6. **Memory Persistence**: Verify context is maintained across sessions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Deploy to Netlify
1. Build the project
2. Deploy the `dist` folder
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review the GitHub issues
- Contact the maintainers

## 🎯 Roadmap

- [ ] Advanced AI negotiation strategies
- [ ] Email integration for automatic timeline updates
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile app version
- [ ] Integration with CRM systems
- [ ] Advanced MemMachine features
- [ ] Multi-language support

---

Built with ❤️ using React, Supabase, OpenAI, and MemMachine.