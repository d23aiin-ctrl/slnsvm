import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Award, Users, Clock } from 'lucide-react';

const classes = [
  { name: 'Pre-Primary', grades: 'Nursery, LKG, UKG', description: 'Foundation years with play-based learning' },
  { name: 'Primary', grades: 'Class I - V', description: 'Building fundamental skills and knowledge' },
  { name: 'Middle School', grades: 'Class VI - VIII', description: 'Developing critical thinking and subject expertise' },
  { name: 'Secondary', grades: 'Class IX - X', description: 'CBSE Board preparation and career guidance' },
  { name: 'Senior Secondary', grades: 'Class XI - XII', description: 'Specialized streams: Science, Commerce, Humanities' },
];

const subjects = {
  science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'],
  commerce: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Informatics Practices'],
  humanities: ['History', 'Geography', 'Political Science', 'Economics', 'Psychology', 'English'],
};

const activities = [
  'Sports & Physical Education',
  'Art & Craft',
  'Music & Dance',
  'Debate & Public Speaking',
  'Science Club',
  'Mathematics Olympiad',
  'Environmental Club',
  'Literary Club',
];

export default function AcademicsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Academics</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Our comprehensive curriculum is designed to foster academic excellence,
            critical thinking, and holistic development.
          </p>
        </div>
      </section>

      {/* CBSE Affiliation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">CBSE Affiliated Curriculum</h2>
              <p className="text-gray-600 mb-4">
                SLNSVM School is affiliated to the Central Board of Secondary Education (CBSE),
                New Delhi. Our curriculum is aligned with CBSE guidelines and focuses on
                competency-based learning.
              </p>
              <p className="text-gray-600 mb-4">
                We follow the National Education Policy (NEP) 2020 framework, emphasizing
                conceptual understanding, creativity, and practical application of knowledge.
              </p>
              <div className="bg-primary-50 rounded-lg p-4 mt-6">
                <p className="font-medium text-primary-900">CBSE Affiliation Number: XXXXXXXXXX</p>
                <p className="text-primary-700">School Code: XXXXXX</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card variant="bordered" className="text-center p-6">
                <BookOpen className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                <p className="font-semibold">CBSE Curriculum</p>
              </Card>
              <Card variant="bordered" className="text-center p-6">
                <Award className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                <p className="font-semibold">Quality Education</p>
              </Card>
              <Card variant="bordered" className="text-center p-6">
                <Users className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                <p className="font-semibold">Expert Faculty</p>
              </Card>
              <Card variant="bordered" className="text-center p-6">
                <Clock className="w-10 h-10 text-primary-600 mx-auto mb-2" />
                <p className="font-semibold">Structured Learning</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Offered */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Classes Offered</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Card key={cls.name} variant="elevated" className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>{cls.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-600 font-medium mb-2">{cls.grades}</p>
                  <p className="text-gray-600">{cls.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Senior Secondary Streams */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Senior Secondary Streams (XI - XII)
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700">Science Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subjects.science.map((subject) => (
                    <li key={subject} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {subject}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">Commerce Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subjects.commerce.map((subject) => (
                    <li key={subject} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {subject}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-700">Humanities Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subjects.humanities.map((subject) => (
                    <li key={subject} className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      {subject}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Co-curricular Activities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Co-curricular Activities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activities.map((activity) => (
              <div key={activity} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="font-medium text-gray-900">{activity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Assessment Pattern</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Formative Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>Regular class tests and quizzes</li>
                  <li>Project-based assessments</li>
                  <li>Practical examinations</li>
                  <li>Oral assessments and presentations</li>
                  <li>Homework and assignments</li>
                </ul>
              </CardContent>
            </Card>
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Summative Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>Half-yearly examinations</li>
                  <li>Annual examinations</li>
                  <li>Board examinations (Class X & XII)</li>
                  <li>Pre-board examinations</li>
                  <li>Internal assessments</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
