'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Star, 
  Clock, 
  User, 
  Building, 
  Scale, 
  BookOpen, 
  Shield, 
  Gavel, 
  GraduationCap, 
  History, 
  Vote, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  Archive, 
  Plus, 
  Upload, 
  Share, 
  Bookmark, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Lock,
  Globe,
  Users,
  TrendingUp,
  Award,
  Zap,
  Target,
  Heart,
  Flag,
  Megaphone,
  Newspaper,
  ScrollText,
  Library,
  PenTool,
  FileCheck,
  FileClock,
  FileX,
  Layers,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

// Document categories and types
const documentCategories = {
  contracts: {
    name: 'Contracts & Agreements',
    icon: Scale,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  historical: {
    name: 'Historical Documents',
    icon: History,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  political: {
    name: 'Political & Legislative',
    icon: Vote,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  educational: {
    name: 'Educational Resources',
    icon: GraduationCap,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  safety: {
    name: 'Safety & Compliance',
    icon: Shield,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  legal: {
    name: 'Legal Documents',
    icon: Gavel,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  }
};

// Comprehensive synthetic document data
const documentsData = [
  // Contracts & Agreements
  {
    id: 1,
    title: 'Collective Bargaining Agreement 2024-2027',
    category: 'contracts',
    type: 'Master Agreement',
    description: 'Complete collective bargaining agreement between Local 1234 IBEW and Metro Electric Contractors Association',
    dateCreated: '2024-01-15',
    dateModified: '2024-01-15',
    size: '2.4 MB',
    pages: 156,
    author: 'Bargaining Committee',
    status: 'Active',
    access: 'Public',
    tags: ['wages', 'benefits', 'working conditions', 'grievance procedure'],
    downloads: 1247,
    views: 3891,
    starred: true,
    priority: 'high'
  },
  {
    id: 2,
    title: 'Wage Scale Schedule 2024',
    category: 'contracts',
    type: 'Wage Agreement',
    description: 'Current wage scales for all classifications including apprentice progression rates',
    dateCreated: '2024-01-20',
    dateModified: '2024-01-20',
    size: '485 KB',
    pages: 12,
    author: 'Wage Committee',
    status: 'Active',
    access: 'Members Only',
    tags: ['wages', 'apprentice', 'journeyman', 'classifications'],
    downloads: 892,
    views: 2156,
    starred: false,
    priority: 'high'
  },
  {
    id: 3,
    title: 'Health & Welfare Benefits Summary',
    category: 'contracts',
    type: 'Benefits Guide',
    description: 'Comprehensive guide to health insurance, dental, vision, and retirement benefits',
    dateCreated: '2024-01-10',
    dateModified: '2024-01-25',
    size: '1.8 MB',
    pages: 64,
    author: 'Benefits Administrator',
    status: 'Active',
    access: 'Members Only',
    tags: ['health insurance', 'dental', 'vision', 'retirement', 'benefits'],
    downloads: 1456,
    views: 4223,
    starred: true,
    priority: 'high'
  },

  // Historical Documents
  {
    id: 4,
    title: 'Local 1234 Charter - 1952',
    category: 'historical',
    type: 'Charter Document',
    description: 'Original charter establishing Local 1234 IBEW, signed by International President',
    dateCreated: '1952-06-15',
    dateModified: '2023-12-01',
    size: '12.3 MB',
    pages: 8,
    author: 'IBEW International Office',
    status: 'Archived',
    access: 'Public',
    tags: ['charter', 'founding', 'historical', 'IBEW'],
    downloads: 234,
    views: 567,
    starred: false,
    priority: 'medium'
  },
  {
    id: 5,
    title: 'First Strike Documentation - 1967',
    category: 'historical',
    type: 'Strike Records',
    description: 'Complete documentation of the 1967 strike including demands, negotiations, and resolution',
    dateCreated: '1967-08-22',
    dateModified: '2023-11-15',
    size: '8.7 MB',
    pages: 89,
    author: 'Strike Committee',
    status: 'Archived',
    access: 'Public',
    tags: ['strike', '1967', 'negotiations', 'historical'],
    downloads: 156,
    views: 423,
    starred: false,
    priority: 'low'
  },
  {
    id: 6,
    title: 'Union Hall Construction Photos - 1975',
    category: 'historical',
    type: 'Photo Archive',
    description: 'Historical photographs documenting the construction of the current union hall',
    dateCreated: '1975-09-10',
    dateModified: '2023-10-20',
    size: '45.2 MB',
    pages: 127,
    author: 'Building Committee',
    status: 'Archived',
    access: 'Public',
    tags: ['union hall', 'construction', 'photos', '1975'],
    downloads: 89,
    views: 234,
    starred: false,
    priority: 'low'
  },

  // Political & Legislative
  {
    id: 7,
    title: 'Right to Work Opposition Strategy 2024',
    category: 'political',
    type: 'Political Strategy',
    description: 'Comprehensive strategy document for opposing right-to-work legislation in the state',
    dateCreated: '2024-01-05',
    dateModified: '2024-01-28',
    size: '1.2 MB',
    pages: 34,
    author: 'Political Action Committee',
    status: 'Active',
    access: 'Members Only',
    tags: ['right to work', 'legislation', 'political action', 'strategy'],
    downloads: 445,
    views: 1123,
    starred: true,
    priority: 'high'
  },
  {
    id: 8,
    title: 'Candidate Endorsements 2024 Election',
    category: 'political',
    type: 'Endorsement List',
    description: 'Official endorsements for federal, state, and local candidates supporting labor',
    dateCreated: '2024-01-12',
    dateModified: '2024-01-30',
    size: '756 KB',
    pages: 18,
    author: 'Political Action Committee',
    status: 'Active',
    access: 'Public',
    tags: ['endorsements', 'elections', '2024', 'candidates'],
    downloads: 678,
    views: 1567,
    starred: false,
    priority: 'high'
  },
  {
    id: 9,
    title: 'Prevailing Wage Advocacy Toolkit',
    category: 'political',
    type: 'Advocacy Guide',
    description: 'Tools and talking points for advocating prevailing wage policies',
    dateCreated: '2023-11-20',
    dateModified: '2024-01-15',
    size: '2.1 MB',
    pages: 42,
    author: 'Legislative Committee',
    status: 'Active',
    access: 'Members Only',
    tags: ['prevailing wage', 'advocacy', 'toolkit', 'legislation'],
    downloads: 234,
    views: 567,
    starred: false,
    priority: 'medium'
  },

  // Educational Resources
  {
    id: 10,
    title: 'Apprenticeship Program Handbook 2024',
    category: 'educational',
    type: 'Training Manual',
    description: 'Complete handbook for electrical apprenticeship program including curriculum and requirements',
    dateCreated: '2024-01-08',
    dateModified: '2024-01-22',
    size: '3.2 MB',
    pages: 98,
    author: 'Training Director',
    status: 'Active',
    access: 'Public',
    tags: ['apprenticeship', 'training', 'curriculum', 'electrical'],
    downloads: 567,
    views: 1234,
    starred: true,
    priority: 'high'
  },
  {
    id: 11,
    title: 'Electrical Code Study Guide 2023',
    category: 'educational',
    type: 'Study Material',
    description: 'Comprehensive study guide for the National Electrical Code with practice questions',
    dateCreated: '2023-12-01',
    dateModified: '2024-01-10',
    size: '4.5 MB',
    pages: 156,
    author: 'Education Committee',
    status: 'Active',
    access: 'Members Only',
    tags: ['electrical code', 'study guide', 'NEC', 'certification'],
    downloads: 789,
    views: 2345,
    starred: true,
    priority: 'high'
  },
  {
    id: 12,
    title: 'Union Leadership Development Course',
    category: 'educational',
    type: 'Leadership Training',
    description: 'Training materials for developing union leadership skills and steward training',
    dateCreated: '2023-10-15',
    dateModified: '2024-01-05',
    size: '1.9 MB',
    pages: 67,
    author: 'Leadership Institute',
    status: 'Active',
    access: 'Members Only',
    tags: ['leadership', 'steward training', 'union skills', 'development'],
    downloads: 345,
    views: 678,
    starred: false,
    priority: 'medium'
  },

  // Safety & Compliance
  {
    id: 13,
    title: 'OSHA 30-Hour Training Materials',
    category: 'safety',
    type: 'Safety Training',
    description: 'Complete OSHA 30-hour construction safety training materials and certification guide',
    dateCreated: '2024-01-03',
    dateModified: '2024-01-20',
    size: '5.8 MB',
    pages: 234,
    author: 'Safety Committee',
    status: 'Active',
    access: 'Members Only',
    tags: ['OSHA', 'safety training', 'construction', 'certification'],
    downloads: 892,
    views: 2156,
    starred: true,
    priority: 'high'
  },
  {
    id: 14,
    title: 'Arc Flash Safety Procedures',
    category: 'safety',
    type: 'Safety Protocol',
    description: 'Detailed procedures for arc flash safety including PPE requirements and incident response',
    dateCreated: '2023-12-15',
    dateModified: '2024-01-18',
    size: '1.4 MB',
    pages: 28,
    author: 'Safety Director',
    status: 'Active',
    access: 'Members Only',
    tags: ['arc flash', 'safety', 'PPE', 'electrical safety'],
    downloads: 456,
    views: 1123,
    starred: true,
    priority: 'high'
  },
  {
    id: 15,
    title: 'Workplace Hazard Reporting Form',
    category: 'safety',
    type: 'Safety Form',
    description: 'Standard form for reporting workplace hazards and safety concerns',
    dateCreated: '2023-11-01',
    dateModified: '2024-01-12',
    size: '234 KB',
    pages: 3,
    author: 'Safety Committee',
    status: 'Active',
    access: 'Public',
    tags: ['hazard reporting', 'safety form', 'workplace safety'],
    downloads: 234,
    views: 567,
    starred: false,
    priority: 'medium'
  },

  // Legal Documents
  {
    id: 16,
    title: 'Grievance Procedure Manual',
    category: 'legal',
    type: 'Legal Guide',
    description: 'Step-by-step guide to the grievance procedure including forms and timelines',
    dateCreated: '2024-01-01',
    dateModified: '2024-01-25',
    size: '1.1 MB',
    pages: 45,
    author: 'Legal Department',
    status: 'Active',
    access: 'Members Only',
    tags: ['grievance', 'procedure', 'legal', 'dispute resolution'],
    downloads: 567,
    views: 1345,
    starred: true,
    priority: 'high'
  },
  {
    id: 17,
    title: 'Workers Rights Under Federal Law',
    category: 'legal',
    type: 'Legal Reference',
    description: 'Comprehensive guide to worker rights under federal labor laws',
    dateCreated: '2023-12-20',
    dateModified: '2024-01-15',
    size: '2.3 MB',
    pages: 78,
    author: 'Legal Counsel',
    status: 'Active',
    access: 'Public',
    tags: ['workers rights', 'federal law', 'labor law', 'legal'],
    downloads: 345,
    views: 789,
    starred: false,
    priority: 'medium'
  },
  {
    id: 18,
    title: 'Arbitration Case Summaries 2023',
    category: 'legal',
    type: 'Case Law',
    description: 'Summaries of arbitration cases from 2023 with outcomes and precedents',
    dateCreated: '2023-12-31',
    dateModified: '2024-01-10',
    size: '1.7 MB',
    pages: 56,
    author: 'Legal Department',
    status: 'Active',
    access: 'Members Only',
    tags: ['arbitration', 'case law', '2023', 'precedents'],
    downloads: 123,
    views: 345,
    starred: false,
    priority: 'low'
  }
];

export default function DocumentsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dateModified');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['contracts']);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Filter and sort documents
  const filteredDocuments = documentsData
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => doc.tags.includes(tag));
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (sortBy === 'dateCreated' || sortBy === 'dateModified') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  // Get all unique tags
  const allTags = Array.from(new Set(documentsData.flatMap(doc => doc.tags))).sort();

  // Group documents by category
  const documentsByCategory = Object.keys(documentCategories).reduce((acc, category) => {
    acc[category] = filteredDocuments.filter(doc => doc.category === category);
    return acc;
  }, {} as Record<string, typeof documentsData>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-500 border-green-500/50';
      case 'Archived': return 'text-yellow-500 border-yellow-500/50';
      case 'Draft': return 'text-blue-500 border-blue-500/50';
      default: return 'text-gray-500 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const toggleFolder = (category: string) => {
    setExpandedFolders(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Document Library</h1>
              <p className="text-muted-foreground">
                Comprehensive collection of union documents, contracts, and resources
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-green-500/50 text-green-500 hover:bg-green-500/10">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                <Plus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(documentCategories).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateModified">Date Modified</SelectItem>
                    <SelectItem value="dateCreated">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex-1"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </Button>
                  
                  <div className="flex border border-border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tag Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Filter by Tags:</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 15).map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "text-xs",
                        selectedTags.includes(tag) 
                          ? "bg-green-500 hover:bg-green-600 text-black" 
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {Object.entries(documentCategories).map(([key, category]) => {
              const count = documentsByCategory[key]?.length || 0;
              const CategoryIcon = category.icon;
              
              return (
                <Card key={key} className={cn("bg-card/50 border-border hover:border-opacity-50 transition-colors cursor-pointer", category.borderColor)}>
                  <CardContent className="p-4 text-center">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2", category.bgColor)}>
                      <CategoryIcon className={cn("w-5 h-5", category.color)} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{count}</div>
                    <div className="text-xs text-muted-foreground">{category.name}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Documents Display */}
          {viewMode === 'grid' ? (
            // Grid View
            <div className="space-y-8">
              {Object.entries(documentCategories).map(([categoryKey, category]) => {
                const categoryDocs = documentsByCategory[categoryKey] || [];
                if (categoryDocs.length === 0 && selectedCategory !== 'all') return null;
                
                const CategoryIcon = category.icon;
                const isExpanded = expandedFolders.includes(categoryKey);
                
                return (
                  <div key={categoryKey} className="space-y-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer group"
                      onClick={() => toggleFolder(categoryKey)}
                    >
                      {isExpanded ? (
                        <FolderOpen className={cn("w-6 h-6", category.color)} />
                      ) : (
                        <Folder className={cn("w-6 h-6", category.color)} />
                      )}
                      <h2 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
                        {category.name}
                      </h2>
                      <Badge variant="outline" className={cn("ml-2", category.borderColor, category.color)}>
                        {categoryDocs.length}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-9">
                        {categoryDocs.map((doc) => (
                          <Card key={doc.id} className="bg-card/50 border-border hover:border-green-500/30 transition-all duration-200 group cursor-pointer">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className={cn("w-5 h-5", category.color)} />
                                  {doc.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                  {doc.access === 'Members Only' && <Lock className="w-4 h-4 text-red-500" />}
                                </div>
                                <Badge variant="outline" className={getStatusColor(doc.status)}>
                                  {doc.status}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg line-clamp-2 group-hover:text-green-400 transition-colors">
                                {doc.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {doc.description}
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{doc.type}</span>
                                  <span className={getPriorityColor(doc.priority)}>
                                    {doc.priority} priority
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(doc.dateModified)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <FileText className="w-3 h-3" />
                                    <span>{doc.pages} pages</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Download className="w-3 h-3" />
                                    <span>{doc.downloads}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{doc.views}</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {doc.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs border-green-500/30 text-green-500">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{doc.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex space-x-2 pt-2">
                                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                  <Button size="sm" variant="ghost" className="px-2">
                                    <Share className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <Card className="bg-card/50 border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="p-4 font-medium text-muted-foreground">Document</th>
                        <th className="p-4 font-medium text-muted-foreground">Category</th>
                        <th className="p-4 font-medium text-muted-foreground">Type</th>
                        <th className="p-4 font-medium text-muted-foreground">Modified</th>
                        <th className="p-4 font-medium text-muted-foreground">Size</th>
                        <th className="p-4 font-medium text-muted-foreground">Status</th>
                        <th className="p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => {
                        const category = documentCategories[doc.category as keyof typeof documentCategories];
                        const CategoryIcon = category.icon;
                        
                        return (
                          <tr key={doc.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <CategoryIcon className={cn("w-5 h-5", category.color)} />
                                <div>
                                  <div className="font-medium text-white flex items-center space-x-2">
                                    <span>{doc.title}</span>
                                    {doc.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                    {doc.access === 'Members Only' && <Lock className="w-4 h-4 text-red-500" />}
                                  </div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {doc.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className={cn(category.borderColor, category.color)}>
                                {category.name}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{doc.type}</td>
                            <td className="p-4 text-sm text-muted-foreground">{formatDate(doc.dateModified)}</td>
                            <td className="p-4 text-sm text-muted-foreground">{formatFileSize(doc.size)}</td>
                            <td className="p-4">
                              <Badge variant="outline" className={getStatusColor(doc.status)}>
                                {doc.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Share className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          <div className="mt-8 text-center text-muted-foreground">
            <p>
              Showing {filteredDocuments.length} of {documentsData.length} documents
              {selectedCategory !== 'all' && ` in ${documentCategories[selectedCategory as keyof typeof documentCategories].name}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}