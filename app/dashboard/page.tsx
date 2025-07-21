'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Shield, 
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  Zap,
  Settings,
  Bell,
  Download,
  Eye,
  ChevronRight,
  Activity,
  Target,
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Send,
  Video,
  BookOpen,
  AlertOctagon,
  Info,
  CheckSquare,
  X,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Clock3,
  UserCheck,
  MessageCircle,
  PhoneCall,
  Briefcase,
  Home,
  Car,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

// Enhanced member data for Mike Rodriguez
const memberData = {
  id: 'EL-1234-2019-0847',
  name: 'Mike Rodriguez',
  title: 'Journeyman Level 3 Electrical',
  local: 'Local 1234',
  memberSince: '2019-03-15',
  profileCompletion: 85,
  avatar: '/api/placeholder/150/150',
  contact: {
    email: 'mike.rodriguez@email.com',
    phone: '(555) 123-4567',
    address: '1234 Union Ave, City, ST 12345'
  },
  employment: {
    employer: 'Metro Electric Contractors',
    position: 'Senior Electrician',
    startDate: '2021-06-01',
    classification: 'Inside Wireman',
    payRate: '$42.50/hr',
    workSite: 'Downtown Convention Center Project'
  },
  stats: {
    aiMessages: { current: 47, total: 50 },
    grievances: { active: 3, total: 12, resolved: 9 },
    documents: { available: 89, accessed: 34 },
    safetyProtocols: { completed: 25, required: 28 },
    trainingProgress: 87
  },
  steward: {
    name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'sarah.johnson@local1234.org',
    availability: 'Available',
    lastContact: '2024-01-10T14:30:00Z'
  }
};

// Analytics data for charts
const analyticsData = {
  monthlyActivity: [
    { month: 'Aug', aiUsage: 32, grievances: 1, training: 2, documents: 8 },
    { month: 'Sep', aiUsage: 28, grievances: 2, training: 3, documents: 12 },
    { month: 'Oct', aiUsage: 35, grievances: 0, training: 1, documents: 15 },
    { month: 'Nov', aiUsage: 42, grievances: 1, training: 4, documents: 18 },
    { month: 'Dec', aiUsage: 38, grievances: 2, training: 2, documents: 22 },
    { month: 'Jan', aiUsage: 47, grievances: 3, training: 5, documents: 34 }
  ],
  aiUsagePatterns: [
    { category: 'Safety Questions', percentage: 35, count: 16 },
    { category: 'Contract Queries', percentage: 28, count: 13 },
    { category: 'Benefits Info', percentage: 20, count: 9 },
    { category: 'Training Help', percentage: 12, count: 6 },
    { category: 'General Support', percentage: 5, count: 3 }
  ],
  grievanceResolution: [
    { status: 'Resolved Favorably', count: 7, percentage: 78 },
    { status: 'Partially Resolved', count: 2, percentage: 22 },
    { status: 'Pending', count: 3, percentage: 0 }
  ]
};

// Notifications data
const notifications = [
  {
    id: 1,
    type: 'contract',
    title: 'New Contract Amendment Available',
    message: 'Wage increase effective February 1st, 2024',
    timestamp: '2024-01-15T10:30:00Z',
    priority: 'high',
    read: false,
    icon: FileText,
    color: 'text-blue-500'
  },
  {
    id: 2,
    type: 'safety',
    title: 'Safety Alert: Arc Flash Protocol Update',
    message: 'New PPE requirements for electrical work above 480V',
    timestamp: '2024-01-14T14:15:00Z',
    priority: 'high',
    read: false,
    icon: AlertOctagon,
    color: 'text-red-500'
  },
  {
    id: 3,
    type: 'training',
    title: 'Training Deadline Reminder',
    message: 'OSHA refresher course due by January 31st',
    timestamp: '2024-01-13T09:00:00Z',
    priority: 'medium',
    read: false,
    icon: Clock,
    color: 'text-yellow-500'
  },
  {
    id: 4,
    type: 'message',
    title: 'Message from Steward',
    message: 'Sarah Johnson: Regarding your overtime question...',
    timestamp: '2024-01-12T16:45:00Z',
    priority: 'medium',
    read: true,
    icon: MessageCircle,
    color: 'text-green-500'
  },
  {
    id: 5,
    type: 'meeting',
    title: 'Union Meeting Tomorrow',
    message: 'Monthly Local 1234 meeting at 7:00 PM',
    timestamp: '2024-01-11T12:00:00Z',
    priority: 'low',
    read: true,
    icon: Users,
    color: 'text-purple-500'
  },
  {
    id: 6,
    type: 'benefits',
    title: 'Health Insurance Update',
    message: 'New dental coverage options available',
    timestamp: '2024-01-10T11:30:00Z',
    priority: 'low',
    read: true,
    icon: Shield,
    color: 'text-indigo-500'
  }
];

// Calendar events
const calendarEvents = [
  {
    id: 1,
    title: 'Union Meeting',
    date: '2024-01-18',
    time: '19:00',
    type: 'meeting',
    location: 'Union Hall',
    description: 'Monthly membership meeting',
    icon: Users,
    color: 'text-purple-500'
  },
  {
    id: 2,
    title: 'Safety Training',
    date: '2024-01-22',
    time: '08:00',
    type: 'training',
    location: 'Training Center',
    description: 'Confined Space Entry certification',
    icon: Shield,
    color: 'text-orange-500'
  },
  {
    id: 3,
    title: 'Grievance Hearing',
    date: '2024-01-25',
    time: '14:00',
    type: 'grievance',
    location: 'Management Office',
    description: 'GR-2024-015 overtime dispute',
    icon: AlertTriangle,
    color: 'text-yellow-500'
  },
  {
    id: 4,
    title: 'Contract Negotiation',
    date: '2024-01-30',
    time: '10:00',
    type: 'contract',
    location: 'Conference Room A',
    description: 'Bargaining committee meeting',
    icon: FileText,
    color: 'text-blue-500'
  },
  {
    id: 5,
    title: 'OSHA Refresher Due',
    date: '2024-01-31',
    time: '23:59',
    type: 'deadline',
    location: 'Online',
    description: 'Complete annual safety training',
    icon: Clock,
    color: 'text-red-500'
  }
];

// Emergency contacts
const emergencyContacts = [
  {
    id: 1,
    name: 'Union Emergency Line',
    phone: '(555) 911-HELP',
    type: 'emergency',
    available: '24/7',
    icon: Phone,
    color: 'text-red-500'
  },
  {
    id: 2,
    name: 'Safety Hotline',
    phone: '(555) 123-SAFE',
    type: 'safety',
    available: '24/7',
    icon: Shield,
    color: 'text-orange-500'
  },
  {
    id: 3,
    name: 'Steward Sarah Johnson',
    phone: '(555) 987-6543',
    type: 'steward',
    available: 'Mon-Fri 7AM-6PM',
    icon: UserCheck,
    color: 'text-green-500'
  },
  {
    id: 4,
    name: 'Benefits Office',
    phone: '(555) 456-7890',
    type: 'benefits',
    available: 'Mon-Fri 9AM-5PM',
    icon: Building,
    color: 'text-blue-500'
  }
];

// Workplace safety status
const safetyStatus = {
  overall: 'Good',
  lastIncident: '127 days ago',
  currentHazards: 2,
  completedInspections: 15,
  pendingActions: 3,
  indicators: [
    { name: 'PPE Compliance', status: 'excellent', value: 98 },
    { name: 'Hazard Reports', status: 'good', value: 85 },
    { name: 'Training Current', status: 'warning', value: 72 },
    { name: 'Equipment Status', status: 'good', value: 89 }
  ]
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [stewardMessage, setStewardMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleCardClick = (cardType: string) => {
    setLoadingStates(prev => ({ ...prev, [cardType]: true }));
    
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [cardType]: false }));
      if (cardType === 'video-steward') {
        window.location.href = '/dashboard/video-steward';
      } else {
        console.log(`Navigating to ${cardType}`);
      }
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setLoadingStates(prev => ({ ...prev, [action]: true }));
    
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [action]: false }));
      console.log(`Executing action: ${action}`);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return time.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-green-500/30">
                <AvatarImage src={memberData.avatar} alt={memberData.name} />
                <AvatarFallback className="bg-green-500/20 text-green-500 text-xl font-bold">
                  {memberData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Welcome back, {memberData.name.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">
                  {memberData.title} • {memberData.local}
                </p>
                <p className="text-sm text-muted-foreground">
                  Currently at: {memberData.employment.workSite}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500/50 text-green-500 hover:bg-green-500/10 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Action Center */}
          <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-500" />
                <span>Quick Action Center</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Button
                  className="h-20 flex flex-col items-center justify-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                  onClick={() => handleQuickAction('file-grievance')}
                  disabled={loadingStates['file-grievance']}
                >
                  {loadingStates['file-grievance'] ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 mb-1" />
                      <span className="text-xs">File Grievance</span>
                    </>
                  )}
                </Button>

                <Button
                  className="h-20 flex flex-col items-center justify-center bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400"
                  onClick={() => handleQuickAction('schedule-training')}
                  disabled={loadingStates['schedule-training']}
                >
                  {loadingStates['schedule-training'] ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <GraduationCap className="w-6 h-6 mb-1" />
                      <span className="text-xs">Schedule Training</span>
                    </>
                  )}
                </Button>

                <Button
                  className="h-20 flex flex-col items-center justify-center bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400"
                  onClick={() => handleQuickAction('emergency-contact')}
                  disabled={loadingStates['emergency-contact']}
                >
                  {loadingStates['emergency-contact'] ? (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-6 h-6 mb-1" />
                      <span className="text-xs">Emergency Contact</span>
                    </>
                  )}
                </Button>

                <Button
                  className="h-20 flex flex-col items-center justify-center bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400"
                  onClick={() => handleQuickAction('steward-chat')}
                  disabled={loadingStates['steward-chat']}
                >
                  {loadingStates['steward-chat'] ? (
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-6 h-6 mb-1" />
                      <span className="text-xs">Steward Chat</span>
                    </>
                  )}
                </Button>

                <Button
                  className="h-20 flex flex-col items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400"
                  onClick={() => handleQuickAction('chat-ai')}
                  disabled={loadingStates['chat-ai']}
                >
                  {loadingStates['chat-ai'] ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-6 h-6 mb-1" />
                      <span className="text-xs">Chat with AI</span>
                    </>
                  )}
                </Button>

                <Button
                  className="h-20 flex flex-col items-center justify-center bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400"
                  onClick={() => handleQuickAction('safety-report')}
                  disabled={loadingStates['safety-report']}
                >
                  {loadingStates['safety-report'] ? (
                    <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-6 h-6 mb-1" />
                      <span className="text-xs">Safety Report</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            {/* Member Analytics */}
            <Card className="lg:col-span-2 bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span>Member Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Monthly Activity Trends */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Monthly Activity Trends</h4>
                    <div className="h-32 flex items-end justify-between space-x-2">
                      {analyticsData.monthlyActivity.map((month, index) => (
                        <div key={month.month} className="flex-1 flex flex-col items-center">
                          <div className="w-full space-y-1 mb-2">
                            <div 
                              className="bg-green-500/30 rounded-sm"
                              style={{ height: `${(month.aiUsage / 50) * 80}px` }}
                            />
                            <div 
                              className="bg-yellow-500/30 rounded-sm"
                              style={{ height: `${(month.grievances / 3) * 20}px` }}
                            />
                            <div 
                              className="bg-purple-500/30 rounded-sm"
                              style={{ height: `${(month.training / 5) * 30}px` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{month.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500/30 rounded" />
                        <span>AI Usage</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-500/30 rounded" />
                        <span>Grievances</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-purple-500/30 rounded" />
                        <span>Training</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Usage Patterns */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">AI Usage Patterns</h4>
                    <div className="space-y-2">
                      {analyticsData.aiUsagePatterns.map((pattern, index) => (
                        <div key={pattern.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-sm">{pattern.category}</span>
                            <div className="flex-1 bg-muted/30 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pattern.percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">{pattern.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Center */}
            <Card className="lg:col-span-2 bg-card/50 border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <span>Notification Center</span>
                  </CardTitle>
                  <Badge variant="outline" className="border-red-500/50 text-red-500">
                    {unreadNotifications} new
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.slice(0, 6).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        notification.read 
                          ? "bg-muted/20 border-border" 
                          : "bg-blue-500/10 border-blue-500/30"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        notification.priority === 'high' && "bg-red-500/20",
                        notification.priority === 'medium' && "bg-yellow-500/20",
                        notification.priority === 'low' && "bg-green-500/20"
                      )}>
                        <notification.icon className={cn("w-4 h-4", notification.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-medium",
                            notification.read ? "text-muted-foreground" : "text-white"
                          )}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              notification.priority === 'high' && "border-red-500/50 text-red-500",
                              notification.priority === 'medium' && "border-yellow-500/50 text-yellow-500",
                              notification.priority === 'low' && "border-green-500/50 text-green-500"
                            )}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                    View All Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Calendar Integration */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-purple-500" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calendarEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 bg-background/30 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        event.type === 'meeting' && "bg-purple-500/20",
                        event.type === 'training' && "bg-orange-500/20",
                        event.type === 'grievance' && "bg-yellow-500/20",
                        event.type === 'contract' && "bg-blue-500/20",
                        event.type === 'deadline' && "bg-red-500/20"
                      )}>
                        <event.icon className={cn("w-4 h-4", event.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                          <Clock3 className="w-3 h-3" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    View Full Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Steward Communication Panel */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-green-500" />
                  <span>Steward Communication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Steward Info */}
                  <div className="flex items-center space-x-3 p-3 bg-background/30 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-green-500/20 text-green-500">
                        {memberData.steward.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{memberData.steward.name}</h4>
                      <p className="text-xs text-muted-foreground">Union Steward</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-500">{memberData.steward.availability}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                      <PhoneCall className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-500/50 text-green-500 hover:bg-green-500/10">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>

                  {/* Quick Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Message</label>
                    <Textarea
                      placeholder="Type your message to the steward..."
                      value={stewardMessage}
                      onChange={(e) => setStewardMessage(e.target.value)}
                      className="min-h-[80px] bg-background/50"
                    />
                    <Button 
                      size="sm" 
                      className="w-full bg-green-500 hover:bg-green-600 text-black"
                      disabled={!stewardMessage.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>

                  {/* Book Consultation */}
                  <Button variant="outline" size="sm" className="w-full border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                    <Video className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts & Safety Status */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-red-500" />
                  <span>Emergency & Safety</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Emergency Contacts */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Emergency Contacts</h4>
                    <div className="space-y-2">
                      {emergencyContacts.slice(0, 3).map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-2 bg-background/30 rounded-lg hover:bg-background/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <contact.icon className={cn("w-4 h-4", contact.color)} />
                            <div>
                              <div className="text-sm font-medium">{contact.name}</div>
                              <div className="text-xs text-muted-foreground">{contact.available}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workplace Safety Status */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Workplace Safety Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Status</span>
                        <Badge variant="outline" className="border-green-500/50 text-green-500">
                          {safetyStatus.overall}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Last incident: {safetyStatus.lastIncident}
                      </div>

                      <div className="space-y-2">
                        {safetyStatus.indicators.slice(0, 2).map((indicator, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{indicator.name}</span>
                              <span className={cn(
                                indicator.status === 'excellent' && "text-green-500",
                                indicator.status === 'good' && "text-blue-500",
                                indicator.status === 'warning' && "text-yellow-500"
                              )}>
                                {indicator.value}%
                              </span>
                            </div>
                            <Progress value={indicator.value} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <AlertOctagon className="w-4 h-4 mr-2" />
                    Report Safety Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* AI Assistant Card */}
            <Card 
              className={cn(
                "bg-card/50 border-border hover:border-green-500/50 transition-all duration-300 cursor-pointer group",
                hoveredCard === 'ai' && "scale-105 shadow-lg shadow-green-500/20"
              )}
              onMouseEnter={() => setHoveredCard('ai')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick('ai')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Assistant</CardTitle>
                  {loadingStates.ai ? (
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold neon-text">
                    {memberData.stats.aiMessages.current}/{memberData.stats.aiMessages.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Messages this month</div>
                  <Progress 
                    value={(memberData.stats.aiMessages.current / memberData.stats.aiMessages.total) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {memberData.stats.aiMessages.total - memberData.stats.aiMessages.current} remaining
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Grievances Card */}
            <Card 
              className={cn(
                "bg-card/50 border-border hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group",
                hoveredCard === 'grievances' && "scale-105 shadow-lg shadow-yellow-500/20"
              )}
              onMouseEnter={() => setHoveredCard('grievances')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick('grievances')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Grievances</CardTitle>
                  {loadingStates.grievances ? (
                    <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-yellow-500">
                    {memberData.stats.grievances.active}
                  </div>
                  <div className="text-sm text-muted-foreground">Active cases</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-500">{memberData.stats.grievances.resolved} resolved</span>
                    <span className="text-muted-foreground">{memberData.stats.grievances.total} total</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((memberData.stats.grievances.resolved / memberData.stats.grievances.total) * 100)}% success rate
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Progress Card */}
            <Card 
              className={cn(
                "bg-card/50 border-border hover:border-purple-500/50 transition-all duration-300 cursor-pointer group",
                hoveredCard === 'training' && "scale-105 shadow-lg shadow-purple-500/20"
              )}
              onMouseEnter={() => setHoveredCard('training')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick('training')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Training Progress</CardTitle>
                  {loadingStates.training ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-500">
                    {memberData.stats.trainingProgress}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall completion</div>
                  <Progress value={memberData.stats.trainingProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Next: Arc Flash Safety (Due Jan 31)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Compliance Card */}
            <Card 
              className={cn(
                "bg-card/50 border-border hover:border-orange-500/50 transition-all duration-300 cursor-pointer group",
                hoveredCard === 'safety' && "scale-105 shadow-lg shadow-orange-500/20"
              )}
              onMouseEnter={() => setHoveredCard('safety')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick('safety')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Safety Compliance</CardTitle>
                  {loadingStates.safety ? (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-500">
                    {Math.round((memberData.stats.safetyProtocols.completed / memberData.stats.safetyProtocols.required) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {memberData.stats.safetyProtocols.completed}/{memberData.stats.safetyProtocols.required} protocols
                  </div>
                  <Progress 
                    value={(memberData.stats.safetyProtocols.completed / memberData.stats.safetyProtocols.required) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {memberData.stats.safetyProtocols.required - memberData.stats.safetyProtocols.completed} remaining
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Steward Card */}
            <Card 
              className={cn(
                "bg-card/50 border-border hover:border-blue-500/50 transition-all duration-300 cursor-pointer group",
                hoveredCard === 'video-steward' && "scale-105 shadow-lg shadow-blue-500/20"
              )}
              onMouseEnter={() => setHoveredCard('video-steward')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick('video-steward')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Video Steward</CardTitle>
                  {loadingStates['video-steward'] ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Video className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-500">
                    Available
                  </div>
                  <div className="text-sm text-muted-foreground">Labor Rights Advocate</div>
                  <div className="flex items-center space-x-1 text-xs text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Online Now</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expert consultation available
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}