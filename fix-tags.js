const fs = require('fs');
const path = require('path');
const base = 'c:/Users/Rupesh kumar sah/OneDrive/Desktop/rupesh3/frontend/src';

function write(file, lines) {
    fs.writeFileSync(path.join(base, file), lines.join('\n'));
    console.log('Fixed', file);
}

// Fix Login.tsx - missing </div> for the hero section
write('pages/Login.tsx', [
    "import { useState } from 'react';",
    "import { Link, useNavigate } from 'react-router-dom';",
    "import { motion } from 'framer-motion';",
    "import { Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';",
    "import toast from 'react-hot-toast';",
    "import { useAuthStore } from '../stores/authStore';",
    "import Input from '../components/ui/Input';",
    "import Button from '../components/ui/Button';",
    "",
    "export default function Login() {",
    "  const navigate = useNavigate();",
    "  const { login } = useAuthStore();",
    "  const [email, setEmail] = useState('');",
    "  const [password, setPassword] = useState('');",
    "  const [showPassword, setShowPassword] = useState(false);",
    "  const [loading, setLoading] = useState(false);",
    "",
    "  const handleSubmit = async (e: React.FormEvent) => {",
    "    e.preventDefault();",
    "    if (!email || !password) { toast.error('Please fill in all fields'); return; }",
    "    setLoading(true);",
    "    try {",
    "      await login(email, password);",
    "      toast.success('Welcome back!');",
    "      navigate('/');",
    "    } catch (err: any) {",
    "      toast.error(err.response?.data?.message || 'Login failed');",
    "    } finally { setLoading(false); }",
    "  };",
    "",
    "  return (",
    "    <div className=\"flex min-h-screen bg-slate-50 dark:bg-slate-950\">",
    "      <div className=\"hidden lg:flex lg:w-1/2 relative overflow-hidden\">",
    "        <div className=\"absolute inset-0 bg-violet-600\" />",
    "        <div className=\"absolute inset-0 opacity-20 mix-blend-overlay\"",
    "          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />",
    "        <div className=\"relative z-10 flex flex-col justify-center px-16 text-white\">",
    "          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>",
    "            <div className=\"flex items-center gap-3 mb-8\">",
    "              <div className=\"h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center\">",
    "                <Zap className=\"h-7 w-7 text-white\" />",
    "              </div>",
    "              <span className=\"text-2xl font-bold\">AI CRM</span>",
    "            </div>",
    "            <h1 className=\"text-4xl font-bold mb-4 leading-tight\">Close more deals with AI-powered insights</h1>",
    "            <p className=\"text-lg text-violet-100 max-w-md\">Predict lead conversion, automate follow-ups, and track your pipeline all in one intelligent platform.</p>",
    "          </motion.div>",
    "        </div>",
    "      </div>",
    "",
    "      <div className=\"flex-1 flex items-center justify-center p-6\">",
    "        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className=\"w-full max-w-sm\">",
    "          <div className=\"text-center mb-8\">",
    "            <div className=\"lg:hidden flex items-center justify-center gap-2 mb-6\">",
    "              <div className=\"h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center\">",
    "                <Zap className=\"h-6 w-6 text-white\" />",
    "              </div>",
    "              <span className=\"text-xl font-bold text-slate-900 dark:text-white\">AI CRM</span>",
    "            </div>",
    "            <h2 className=\"text-2xl font-bold text-slate-900 dark:text-white\">Welcome back</h2>",
    "            <p className=\"text-sm text-slate-500 dark:text-slate-400 mt-1\">Sign in to your account</p>",
    "          </div>",
    "",
    "          <form onSubmit={handleSubmit} className=\"space-y-4\">",
    "            <Input label=\"Email\" type=\"email\" icon={<Mail className=\"h-4 w-4\" />} value={email} onChange={e => setEmail(e.target.value)} required />",
    "            <div className=\"relative\">",
    "              <Input label=\"Password\" type={showPassword ? 'text' : 'password'} icon={<Lock className=\"h-4 w-4\" />} value={password} onChange={e => setPassword(e.target.value)} required />",
    "              <button type=\"button\" onClick={() => setShowPassword(!showPassword)} className=\"absolute right-3 top-[34px] text-slate-400 hover:text-slate-600\">",
    "                {showPassword ? <EyeOff className=\"h-4 w-4\" /> : <Eye className=\"h-4 w-4\" />}",
    "              </button>",
    "            </div>",
    "            <Button type=\"submit\" className=\"w-full\" disabled={loading}>",
    "              {loading ? <Loader2 className=\"h-4 w-4 animate-spin\" /> : 'Sign In'}",
    "            </Button>",
    "          </form>",
    "",
    "          <p className=\"text-center text-sm text-slate-500 dark:text-slate-400 mt-6\">",
    "            Don't have an account? <Link to=\"/register\" className=\"text-violet-600 hover:text-violet-700 font-medium\">Create one</Link>",
    "          </p>",
    "        </motion.div>",
    "      </div>",
    "    </div>",
    "  );",
    "}",
    ""
]);

// Fix Sidebar.tsx using the existing good write-frontend.js content
const sidebar = `import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { LayoutDashboard, Users, KanbanSquare, ListTodo, LogOut, ChevronLeft, ChevronRight, Sun, Moon, Zap } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
  { name: 'Activities', href: '/activities', icon: ListTodo },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-slate-900 dark:text-white text-lg whitespace-nowrap">
              AI CRM
            </motion.span>
          )}
        </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200')}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-violet-600 dark:text-violet-400')} />
              {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
              {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button onClick={toggle}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {user && (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{user.name[0]?.toUpperCase()}</span>
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
            <button onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </button>
          </>
        )}

        <button onClick={onToggle}
          className="flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  );
}`;

fs.writeFileSync(path.join(base, 'components/layout/Sidebar.tsx'), sidebar);
console.log('Fixed Sidebar.tsx');

console.log('All fixes applied');
