import { supabase } from '../supabaseclient';

export async function fetchLessonWithQuestions(topic) {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*, questions(*)')
    .eq('topic', topic);

  if (error) {
    console.error('Error fetching lesson:', error);
    return [];
  }

  return lessons;
}
