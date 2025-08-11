'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Wand2, Download, Copy, Trash2, Loader2, Heart, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  questions: Question[];
  createdAt: Date;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export default function QuizGeneratorPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [contentInput, setContentInput] = useState('');
  const [selectedType, setSelectedType] = useState('quiz');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards'>('quizzes');
  const { toast } = useToast();

  const contentTypes = [
    {
      id: 'quiz',
      name: 'Quiz Questions',
      icon: Heart,
      description: 'Multiple choice questions with explanations',
    },
    { id: 'flashcards', name: 'Flashcards', icon: Sparkles, description: 'Front and back study cards' },
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy', description: 'Basic concepts and definitions' },
    { id: 'medium', name: 'Medium', description: 'Moderate difficulty with some analysis' },
    { id: 'hard', name: 'Hard', description: 'Complex concepts requiring deep understanding' },
  ];

  const sampleTopics = [
    'JavaScript fundamentals and ES6 features',
    'World War II major events and consequences',
    'Human anatomy and physiology basics',
    'Climate change causes and effects',
    'Basic accounting principles and practices',
    "Shakespeare's major works and themes",
  ];

  const generateContent = async () => {
    if (!contentInput.trim()) {
      toast({
        title: 'Please enter content',
        description: 'Provide the topic or content to generate from.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (selectedType === 'quiz') {
        const mockQuiz = generateMockQuiz(contentInput.trim());
        setQuizzes((prev) => [mockQuiz, ...prev]);
      } else {
        const mockFlashcards = generateMockFlashcards(contentInput.trim());
        setFlashcards((prev) => [...mockFlashcards, ...prev]);
      }

      setContentInput('');

      toast({
        title: `${selectedType === 'quiz' ? 'Quiz' : 'Flashcards'} generated!`,
        description: 'Your study materials are ready.',
      });
    } catch (error) {
      toast({
        title: 'Error generating content',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockQuiz = (topic: string): Quiz => {
    const questions: Question[] = Array.from({ length: questionCount }, (_, i) => ({
      id: `q-${Date.now()}-${i}`,
      question: `What is the most important concept related to ${topic} in question ${i + 1}?`,
      options: [
        `Correct answer about ${topic}`,
        `Incorrect option A for ${topic}`,
        `Incorrect option B for ${topic}`,
        `Incorrect option C for ${topic}`,
      ],
      correctAnswer: 0,
      explanation: `This is the correct answer because it directly relates to the core principles of ${topic}. Understanding this concept is fundamental to mastering the subject.`,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
    }));

    return {
      id: Date.now().toString(),
      title: `${topic} - Quiz`,
      description: `A comprehensive quiz covering key concepts in ${topic}`,
      topic,
      difficulty,
      questionCount,
      questions,
      createdAt: new Date(),
    };
  };

  const generateMockFlashcards = (topic: string): Flashcard[] => {
    return Array.from({ length: Math.min(questionCount, 10) }, (_, i) => ({
      id: `fc-${Date.now()}-${i}`,
      front: `Key Term ${i + 1} in ${topic}`,
      back: `This is the definition or explanation of key term ${i + 1} related to ${topic}. It provides essential information that students need to understand and remember.`,
      category: topic,
    }));
  };

  const downloadQuiz = (quiz: Quiz) => {
    const content = `${quiz.title}\n${quiz.description}\n\nQuestions:\n\n${quiz.questions
      .map(
        (q, i) =>
          `${i + 1}. ${q.question}\n${q.options
            .map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`)
            .join(
              '\n'
            )}\n   Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}\n   Explanation: ${q.explanation}\n`
      )
      .join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${quiz.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFlashcards = () => {
    const content = flashcards
      .map((card) => `Front: ${card.front}\nBack: ${card.back}\nCategory: ${card.category}\n---`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'Content has been copied.',
    });
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    toast({
      title: 'Quiz deleted',
      description: 'The quiz has been removed.',
    });
  };

  const deleteFlashcard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
    toast({
      title: 'Flashcard deleted',
      description: 'The flashcard has been removed.',
    });
  };

  const handleSampleTopic = (topic: string) => {
    setContentInput(topic);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-teal-100 rounded-lg'>
              <Wand2 className='size-6 text-teal-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>Quiz & Flashcard Generator</h1>
              <p className='text-muted-foreground'>Create quizzes and flashcards from any content</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Generator Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='size-5' />
                  Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Content Type */}
                <div className='space-y-3'>
                  <Label>Content Type</Label>
                  <div className='space-y-2'>
                    {contentTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? 'default' : 'outline'}
                        onClick={() => setSelectedType(type.id)}
                        className='w-full justify-start h-auto p-3'>
                        <type.icon className='size-4 mr-3' />
                        <div className='text-left'>
                          <div className='font-medium'>{type.name}</div>
                          <div className='text-xs text-muted-foreground'>{type.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content Input */}
                <div className='space-y-3'>
                  <Label htmlFor='content'>Topic or Content</Label>
                  <Textarea
                    id='content'
                    placeholder='Enter the topic, text, or content you want to create study materials from...'
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Question Count */}
                <div className='space-y-3'>
                  <Label htmlFor='count'>
                    {selectedType === 'quiz' ? 'Number of Questions' : 'Number of Cards'}: {questionCount}
                  </Label>
                  <input
                    type='range'
                    id='count'
                    min='3'
                    max='20'
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>3</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className='space-y-3'>
                  <Label>Difficulty Level</Label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className='w-full p-2 border border-input rounded-md bg-background'>
                    {difficulties.map((diff) => (
                      <option key={diff.id} value={diff.id}>
                        {diff.name} - {diff.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateContent}
                  disabled={isGenerating || !contentInput.trim()}
                  className='w-full'>
                  {isGenerating ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className='size-4 mr-2' />
                      Generate {selectedType === 'quiz' ? 'Quiz' : 'Flashcards'}
                    </>
                  )}
                </Button>

                {/* Sample Topics */}
                <div className='space-y-3'>
                  <Label>Sample Topics</Label>
                  <div className='space-y-2'>
                    {sampleTopics.slice(0, 3).map((topic, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        size='sm'
                        onClick={() => handleSampleTopic(topic)}
                        className='w-full text-left h-auto p-2 text-xs justify-start'>
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex space-x-4'>
                    <Button
                      variant={activeTab === 'quizzes' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('quizzes')}
                      size='sm'>
                      <Heart className='size-4 mr-2' />
                      Quizzes ({quizzes.length})
                    </Button>
                    <Button
                      variant={activeTab === 'flashcards' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('flashcards')}
                      size='sm'>
                      <BookOpen className='size-4 mr-2' />
                      Flashcards ({flashcards.length})
                    </Button>
                  </div>
                  {(activeTab === 'quizzes' ? quizzes.length : flashcards.length) > 0 && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        if (activeTab === 'quizzes') {
                          setQuizzes([]);
                        } else {
                          setFlashcards([]);
                        }
                      }}>
                      <Trash2 className='size-4 mr-2' />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'quizzes' ? (
                  quizzes.length === 0 ? (
                    <div className='text-center py-12'>
                      <Heart className='size-16 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-semibold mb-2'>No quizzes generated yet</h3>
                      <p className='text-muted-foreground mb-4'>Enter a topic and generate your first quiz</p>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto'>
                        {sampleTopics.slice(3, 6).map((topic, index) => (
                          <Button
                            key={index}
                            variant='outline'
                            size='sm'
                            onClick={() => handleSampleTopic(topic)}
                            className='text-xs'>
                            {topic.split(' ').slice(0, 4).join(' ')}...
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {quizzes.map((quiz) => (
                        <div key={quiz.id} className='border rounded-lg p-6'>
                          {/* Quiz Header */}
                          <div className='flex items-center justify-between mb-4'>
                            <div>
                              <h3 className='text-lg font-semibold'>{quiz.title}</h3>
                              <p className='text-sm text-muted-foreground'>{quiz.description}</p>
                              <div className='flex items-center space-x-2 mt-2'>
                                <Badge variant='secondary'>{quiz.questionCount} questions</Badge>
                                <Badge variant='outline'>{quiz.difficulty}</Badge>
                              </div>
                            </div>
                            <div className='flex space-x-2'>
                              <Button variant='outline' size='sm' onClick={() => downloadQuiz(quiz)}>
                                <Download className='size-4 mr-2' />
                                Download
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => deleteQuiz(quiz.id)}
                                className='text-red-500 hover:text-red-700'>
                                <Trash2 className='size-4' />
                              </Button>
                            </div>
                          </div>

                          {/* Questions Preview */}
                          <div className='space-y-4'>
                            {quiz.questions.slice(0, 2).map((question, index) => (
                              <div key={question.id} className='p-4 bg-muted rounded-lg'>
                                <p className='font-medium mb-3'>
                                  {index + 1}. {question.question}
                                </p>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-3'>
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-2 rounded border text-sm ${
                                        optIndex === question.correctAnswer
                                          ? 'bg-green-100 border-green-300 text-green-800'
                                          : 'bg-background'
                                      }`}>
                                      {String.fromCharCode(65 + optIndex)}. {option}
                                    </div>
                                  ))}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  <strong>Explanation:</strong> {question.explanation}
                                </div>
                              </div>
                            ))}
                            {quiz.questions.length > 2 && (
                              <p className='text-sm text-muted-foreground text-center'>
                                ... and {quiz.questions.length - 2} more questions
                              </p>
                            )}
                          </div>

                          <p className='text-xs text-muted-foreground mt-4'>
                            Created: {quiz.createdAt.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                ) : flashcards.length === 0 ? (
                  <div className='text-center py-12'>
                    <BookOpen className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No flashcards generated yet</h3>
                    <p className='text-muted-foreground mb-4'>Create flashcards from any topic or content</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <p className='text-sm text-muted-foreground'>
                        {flashcards.length} flashcards generated
                      </p>
                      <Button variant='outline' size='sm' onClick={downloadFlashcards}>
                        <Download className='size-4 mr-2' />
                        Download All
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {flashcards.map((card) => (
                        <div key={card.id} className='border rounded-lg p-4'>
                          <div className='mb-3'>
                            <Badge variant='outline' className='text-xs'>
                              {card.category}
                            </Badge>
                          </div>
                          <div className='space-y-3'>
                            <div>
                              <p className='text-xs font-medium text-muted-foreground mb-1'>Front:</p>
                              <p className='text-sm'>{card.front}</p>
                            </div>
                            <div>
                              <p className='text-xs font-medium text-muted-foreground mb-1'>Back:</p>
                              <p className='text-sm'>{card.back}</p>
                            </div>
                          </div>
                          <div className='flex space-x-2 mt-3'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => copyContent(`${card.front}\n---\n${card.back}`)}
                              className='size-6 p-0'>
                              <Copy className='size-3' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => deleteFlashcard(card.id)}
                              className='size-6 p-0 text-red-500 hover:text-red-700'>
                              <Trash2 className='size-3' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Study Material Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Effective Quizzes</h4>
                <p className='text-sm text-muted-foreground'>
                  Focus on key concepts, include varied question types, and provide detailed explanations for
                  better learning.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Quality Flashcards</h4>
                <p className='text-sm text-muted-foreground'>
                  Keep front sides concise with clear questions, and back sides detailed with comprehensive
                  answers.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Content Input</h4>
                <p className='text-sm text-muted-foreground'>
                  Provide rich source material - textbook chapters, lecture notes, or detailed topic
                  descriptions work best.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
