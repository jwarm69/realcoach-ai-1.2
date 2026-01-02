'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter } from 'lucide-react';

// Mock data - will connect to existing contacts API later
const contacts = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    email: 'sarah.m@email.com',
    phone: '(555) 123-4567',
    stage: 'Active Opportunity',
    motivation: 'High',
    priority: 85,
  },
  {
    id: 2,
    name: 'James Chen',
    email: 'jchen@email.com',
    phone: '(555) 234-5678',
    stage: 'Under Contract',
    motivation: 'High',
    priority: 92,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    stage: 'New Opportunity',
    motivation: 'Medium',
    priority: 65,
  },
  {
    id: 4,
    name: 'Michael Thompson',
    email: 'mthompson@email.com',
    phone: '(555) 456-7890',
    stage: 'Active Opportunity',
    motivation: 'High',
    priority: 78,
  },
  {
    id: 5,
    name: 'Jessica Lee',
    email: 'jess.lee@email.com',
    phone: '(555) 567-8901',
    stage: 'Lead',
    motivation: 'Low',
    priority: 35,
  },
  {
    id: 6,
    name: 'David Garcia',
    email: 'd.garcia@email.com',
    phone: '(555) 678-9012',
    stage: 'New Opportunity',
    motivation: 'Medium',
    priority: 58,
  },
];

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    'Lead': 'bg-gray-500/20 text-gray-400',
    'New Opportunity': 'bg-blue-500/20 text-blue-400',
    'Active Opportunity': 'bg-accent/20 text-accent',
    'Under Contract': 'bg-yellow-500/20 text-yellow-400',
    'Closed': 'bg-purple-500/20 text-purple-400',
  };
  return colors[stage] || 'bg-gray-500/20 text-gray-400';
};

const getPriorityColor = (priority: number) => {
  if (priority >= 80) return 'text-accent';
  if (priority >= 60) return 'text-yellow-400';
  return 'text-gray-400';
};

export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts] = useState(contacts);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database</h1>
          <p className="text-muted-foreground mt-1">
            {filteredContacts.length} contacts
          </p>
        </div>
        <Button className="bg-accent text-background hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="outline" className="border-border text-foreground">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Stage</TableHead>
                <TableHead className="text-muted-foreground">Motivation</TableHead>
                <TableHead className="text-muted-foreground">Priority</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{contact.name}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(contact.stage)}>{contact.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.motivation}</TableCell>
                  <TableCell className={getPriorityColor(contact.priority)}>
                    {contact.priority}/100
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
