'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Shield, 
  Award, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Settings, 
  Bell, 
  Lock, 
  Eye, 
  EyeOff,
  Building,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Trash2,
  Plus,
  ChevronRight,
  Badge as BadgeIcon,
  GraduationCap,
  Target,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

// Synthetic member data
const memberProfile = {
  personal: {
    id: 'EL-1234-2019-0847',
    firstName: 'Mike',
    lastName: 'Rodriguez',
    email: 'mike.rodriguez@email.com',
    phone: '(555) 123-4567',
    address: {
      street: '1234 Union Ave',
      city: 'Springfield',
      state: 'IL',
      zip: '62701'
    },
    dateOfBirth: '1985-03-15',
    emergencyContact: {
      name: 'Maria Rodriguez',
      relationship: 'Spouse',
      phone: '(555) 987-6543'
    },
    avatar: '/api/placeholder/150/150'
  },
  union: {
    local: 'Local 1234 IBEW',
    memberSince: '2019-03-15',
    membershipStatus: 'Active',
    classification: 'Journeyman Level 3 Electrical',
    bookNumber: 'BK-4578',
    steward: {
      name: 'Sarah Johnson',
      phone: '(555) 987-6543',
      email: 'sarah.johnson@local1234.org'
    },
    dues: {
      status: 'Current',
      amount: 125.50,
      frequency: 'Monthly',
      nextDue: '2024-02-01'
    }
  },
  employment: {
    employer: 'Metro Electric Contractors',
    position: 'Senior Electrician',
    startDate: '2021-06-01',
    payRate: '$42.50/hr',
    classification: 'Inside Wireman',
    workSite: 'Downtown Convention Center Project',
    supervisor: 'Tom Wilson',
    shift: 'Day Shift (7:00 AM - 3:30 PM)'
  },
  certifications: [
    {
      id: 1,
      name: 'OSHA 30-Hour Construction',
      issuer: 'OSHA',
      issueDate: '2023-01-15',
      expiryDate: '2026-01-15',
      status: 'Active',
      credentialId: 'OSHA-30-2023-001234'
    },
    {
      id: 2,
      name: 'Arc Flash Safety',
      issuer: 'NFPA',
      issueDate: '2023-06-10',
      expiryDate: '2024-06-10',
      status: 'Expiring Soon',
      credentialId: 'NFPA-70E-2023-5678'
    },
    {
      id: 3,
      name: 'Confined Space Entry',
      issuer: 'Local 1234 Training Center',
      issueDate: '2023-09-20',
      expiryDate: '2025-09-20',
      status: 'Active',
      credentialId: 'CSE-2023-9012'
    },
    {
      id: 4,
      name: 'First Aid/CPR',
      issuer: 'American Red Cross',
      issueDate: '2023-11-05',
      expiryDate: '2025-11-05',
      status: 'Active',
      credentialId: 'ARC-FA-2023-3456'
    }
  ],
  training: {
    completed: [
      {
        id: 1,
        name: 'Electrical Code Update 2023',
        provider: 'Local 1234 Training Center',
        completionDate: '2023-12-15',
        hours: 8,
        certificate: true
      },
      {
        id: 2,
        name: 'Motor Control Fundamentals',
        provider: 'IBEW Education Department',
        completionDate: '2023-10-22',
        hours: 16,
        certificate: true
      },
      {
        id: 3,
        name: 'Safety Leadership Workshop',
        provider: 'Union Safety Institute',
        completionDate: '2023-08-30',
        hours: 4,
        certificate: true
      }
    ],
    inProgress: [
      {
        id: 4,
        name: 'Advanced PLC Programming',
        provider: 'Technical College',
        startDate: '2024-01-08',
        expectedCompletion: '2024-03-15',
        progress: 65,
        hours: 40
      }
    ],
    upcoming: [
      {
        id: 5,
        name: 'Renewable Energy Systems',
        provider: 'Green Energy Institute',
        startDate: '2024-02-20',
        duration: '3 weeks',
        hours: 24
      }
    ]
  },
  benefits: {
    health: {
      plan: 'IBEW Health & Welfare Plan A',
      coverage: 'Family',
      effectiveDate: '2019-04-01',
      premium: 'Employer Paid'
    },
    dental: {
      plan: 'IBEW Dental Plan',
      coverage: 'Family',
      effectiveDate: '2019-04-01'
    },
    vision: {
      plan: 'IBEW Vision Plan',
      coverage: 'Family',
      effectiveDate: '2019-04-01'
    },
    retirement: {
      pension: {
        plan: 'IBEW Pension Plan',
        yearsOfService: 4.8,
        vestingStatus: 'Fully Vested',
        estimatedMonthlyBenefit: '$2,850'
      },
      annuity: {
        plan: 'IBEW Annuity Plan',
        currentBalance: '$45,230',
        monthlyContribution: '$380'
      }
    }
  },
  performance: {
    safetyRecord: {
      daysWithoutIncident: 1247,
      safetyScore: 98,
      lastIncident: null,
      safetyTrainingHours: 32
    },
    workQuality: {
      rating: 4.8,
      lastReview: '2023-12-01',
      commendations: 3,
      grievances: 0
    },
    attendance: {
      rating: 'Excellent',
      absences: 2,
      tardiness: 0,
      overtimeHours: 156
    }
  }
};

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedProfile, setEditedProfile] = useState(memberProfile);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    console.log('Profile saved:', editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile(memberProfile);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-500 border-green-500/50';
      case 'Expiring Soon': return 'text-yellow-500 border-yellow-500/50';
      case 'Expired': return 'text-red-500 border-red-500/50';
      default: return 'text-gray-500 border-gray-500/50';
    }
  };

  const getCertificationIcon = (status: string) => {
    switch (status) {
      case 'Active': return CheckCircle;
      case 'Expiring Soon': return AlertCircle;
      case 'Expired': return X;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-green-500/30">
                  <AvatarImage src={memberProfile.personal.avatar} alt={`${memberProfile.personal.firstName} ${memberProfile.personal.lastName}`} />
                  <AvatarFallback className="bg-green-500/20 text-green-500 text-2xl font-bold">
                    {memberProfile.personal.firstName[0]}{memberProfile.personal.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-black p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {memberProfile.personal.firstName} {memberProfile.personal.lastName}
                </h1>
                <p className="text-xl text-muted-foreground mb-1">
                  {memberProfile.union.classification}
                </p>
                <p className="text-muted-foreground">
                  {memberProfile.union.local} • Member since {formatDate(memberProfile.union.memberSince)}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <Badge variant="outline" className="border-green-500/50 text-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {memberProfile.union.membershipStatus}
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                    ID: {memberProfile.personal.id}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
              >
                {showSensitiveInfo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showSensitiveInfo ? 'Hide' : 'Show'} Sensitive Info
              </Button>
              
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-card/50 border border-border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                Overview
              </TabsTrigger>
              <TabsTrigger value="employment" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                Employment
              </TabsTrigger>
              <TabsTrigger value="certifications" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                Certifications
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                Training
              </TabsTrigger>
              <TabsTrigger value="benefits" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                Benefits
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                Performance
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{memberProfile.personal.email}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {showSensitiveInfo ? memberProfile.personal.phone : '(***) ***-****'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <div className="flex items-start space-x-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            {showSensitiveInfo ? (
                              <>
                                <div>{memberProfile.personal.address.street}</div>
                                <div>{memberProfile.personal.address.city}, {memberProfile.personal.address.state} {memberProfile.personal.address.zip}</div>
                              </>
                            ) : (
                              <div>**** ***** ****, ***** **</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                        <div className="text-sm mt-1">
                          <div className="font-medium">{memberProfile.personal.emergencyContact.name}</div>
                          <div className="text-muted-foreground">{memberProfile.personal.emergencyContact.relationship}</div>
                          <div className="text-muted-foreground">
                            {showSensitiveInfo ? memberProfile.personal.emergencyContact.phone : '(***) ***-****'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Union Information */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>Union Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Local Union</label>
                        <div className="text-sm font-medium mt-1">{memberProfile.union.local}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Book Number</label>
                        <div className="text-sm mt-1">{memberProfile.union.bookNumber}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Union Steward</label>
                        <div className="text-sm mt-1">
                          <div className="font-medium">{memberProfile.union.steward.name}</div>
                          <div className="text-muted-foreground">{memberProfile.union.steward.email}</div>
                          <div className="text-muted-foreground">{memberProfile.union.steward.phone}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dues Status</label>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="border-green-500/50 text-green-500">
                            {memberProfile.union.dues.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${memberProfile.union.dues.amount}/{memberProfile.union.dues.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Safety Score</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={memberProfile.performance.safetyRecord.safetyScore} className="w-16 h-2" />
                          <span className="text-sm font-bold text-green-500">
                            {memberProfile.performance.safetyRecord.safetyScore}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Work Quality</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < Math.floor(memberProfile.performance.workQuality.rating)
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-400"
                              )}
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">
                            {memberProfile.performance.workQuality.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Days Safe</span>
                        <span className="text-sm font-bold text-green-500">
                          {memberProfile.performance.safetyRecord.daysWithoutIncident}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Certifications</span>
                        <span className="text-sm font-medium">
                          {memberProfile.certifications.filter(cert => cert.status === 'Active').length}/
                          {memberProfile.certifications.length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Training Hours</span>
                        <span className="text-sm font-medium">
                          {memberProfile.training.completed.reduce((sum, training) => sum + training.hours, 0)} hrs
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="space-y-6">
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <span>Current Employment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Employer</label>
                        <div className="text-lg font-semibold mt-1">{memberProfile.employment.employer}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Position</label>
                        <div className="text-lg font-semibold mt-1">{memberProfile.employment.position}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Classification</label>
                        <div className="text-sm mt-1">{memberProfile.employment.classification}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <div className="text-sm mt-1">{formatDate(memberProfile.employment.startDate)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pay Rate</label>
                        <div className="text-lg font-semibold text-green-500 mt-1">
                          {showSensitiveInfo ? memberProfile.employment.payRate : '$**.** /hr'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Work Site</label>
                        <div className="text-sm mt-1">{memberProfile.employment.workSite}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Supervisor</label>
                        <div className="text-sm mt-1">{memberProfile.employment.supervisor}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Shift</label>
                        <div className="text-sm mt-1">{memberProfile.employment.shift}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberProfile.certifications.map((cert) => {
                  const StatusIcon = getCertificationIcon(cert.status);
                  return (
                    <Card key={cert.id} className="bg-card/50 border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{cert.name}</CardTitle>
                          <Badge variant="outline" className={getCertificationStatusColor(cert.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {cert.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Issuer</label>
                            <div className="text-sm mt-1">{cert.issuer}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                              <div className="text-sm mt-1">{formatDate(cert.issueDate)}</div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                              <div className="text-sm mt-1">{formatDate(cert.expiryDate)}</div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                            <div className="text-xs font-mono mt-1 text-muted-foreground">
                              {showSensitiveInfo ? cert.credentialId : '****-****-****'}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="space-y-6">
              {/* Completed Training */}
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Completed Training</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberProfile.training.completed.map((training) => (
                      <div key={training.id} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                        <div>
                          <h4 className="font-medium">{training.name}</h4>
                          <p className="text-sm text-muted-foreground">{training.provider}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed: {formatDate(training.completionDate)} • {training.hours} hours
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {training.certificate && (
                            <Badge variant="outline" className="border-green-500/50 text-green-500">
                              <Award className="w-3 h-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* In Progress Training */}
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span>In Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberProfile.training.inProgress.map((training) => (
                      <div key={training.id} className="p-3 bg-background/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{training.name}</h4>
                            <p className="text-sm text-muted-foreground">{training.provider}</p>
                          </div>
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                            {training.progress}% Complete
                          </Badge>
                        </div>
                        <Progress value={training.progress} className="mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Expected completion: {formatDate(training.expectedCompletion)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Training */}
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>Upcoming Training</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {memberProfile.training.upcoming.map((training) => (
                      <div key={training.id} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                        <div>
                          <h4 className="font-medium">{training.name}</h4>
                          <p className="text-sm text-muted-foreground">{training.provider}</p>
                          <p className="text-xs text-muted-foreground">
                            Starts: {formatDate(training.startDate)} • {training.duration} • {training.hours} hours
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                          Register
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Health Benefits */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>Health Benefits</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Health Insurance</label>
                      <div className="mt-1">
                        <div className="font-medium">{memberProfile.benefits.health.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {memberProfile.benefits.health.coverage} Coverage • {memberProfile.benefits.health.premium}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dental Insurance</label>
                      <div className="mt-1">
                        <div className="font-medium">{memberProfile.benefits.dental.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {memberProfile.benefits.dental.coverage} Coverage
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vision Insurance</label>
                      <div className="mt-1">
                        <div className="font-medium">{memberProfile.benefits.vision.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {memberProfile.benefits.vision.coverage} Coverage
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Retirement Benefits */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span>Retirement Benefits</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pension Plan</label>
                      <div className="mt-1">
                        <div className="font-medium">{memberProfile.benefits.retirement.pension.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {memberProfile.benefits.retirement.pension.yearsOfService} years of service
                        </div>
                        <div className="text-sm text-green-500 font-medium">
                          Est. Monthly Benefit: {showSensitiveInfo ? memberProfile.benefits.retirement.pension.estimatedMonthlyBenefit : '$****'}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Annuity Plan</label>
                      <div className="mt-1">
                        <div className="font-medium">{memberProfile.benefits.retirement.annuity.plan}</div>
                        <div className="text-sm text-green-500 font-medium">
                          Current Balance: {showSensitiveInfo ? memberProfile.benefits.retirement.annuity.currentBalance : '$**,***'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Monthly Contribution: {showSensitiveInfo ? memberProfile.benefits.retirement.annuity.monthlyContribution : '$***'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Safety Record */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>Safety Record</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500 mb-1">
                        {memberProfile.performance.safetyRecord.daysWithoutIncident}
                      </div>
                      <div className="text-sm text-muted-foreground">Days Without Incident</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Safety Score</span>
                        <span className="text-sm font-bold text-green-500">
                          {memberProfile.performance.safetyRecord.safetyScore}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Training Hours</span>
                        <span className="text-sm font-medium">
                          {memberProfile.performance.safetyRecord.safetyTrainingHours} hrs
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Quality */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>Work Quality</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500 mb-1">
                        {memberProfile.performance.workQuality.rating}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Rating</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Review</span>
                        <span className="text-sm font-medium">
                          {formatDate(memberProfile.performance.workQuality.lastReview)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Commendations</span>
                        <span className="text-sm font-medium text-green-500">
                          {memberProfile.performance.workQuality.commendations}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Grievances</span>
                        <span className="text-sm font-medium">
                          {memberProfile.performance.workQuality.grievances}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance */}
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span>Attendance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500 mb-1">
                        {memberProfile.performance.attendance.rating}
                      </div>
                      <div className="text-sm text-muted-foreground">Attendance Rating</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Absences</span>
                        <span className="text-sm font-medium">
                          {memberProfile.performance.attendance.absences} days
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tardiness</span>
                        <span className="text-sm font-medium">
                          {memberProfile.performance.attendance.tardiness} times
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Overtime Hours</span>
                        <span className="text-sm font-medium text-green-500">
                          {memberProfile.performance.attendance.overtimeHours} hrs
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}