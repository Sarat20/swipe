
export const parseResume = async (file) => {
    const fileType = file.type;
    let text = '';
    
    try {
      if (fileType === 'application/pdf') {
        
        text = await readFileAsText(file);
      } else {
        text = await readFileAsText(file);
      }
      
      
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      
      const phoneRegex = /\+?\d[\d\s().-]{6,}\d/g;

      const emails = text.match(emailRegex);
      const phones = text.match(phoneRegex);
     
      const nameRegex = /^[A-Z][a-z]+\s+[A-Z][a-z]+/gm;
      const possibleNames = text.match(nameRegex);
      
     
      const skillKeywords = ['React', 'Node.js', 'JavaScript', 'Python', 'Java', 'HTML', 'CSS', 'MongoDB', 'SQL', 'Git', 'TypeScript', 'Vue', 'Angular', 'Express', 'Redux', 'AWS', 'Docker'];
      const foundSkills = skillKeywords.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
      );
      
      return {
        name: possibleNames?.[0] || '',
        email: emails?.[0] || '',
        phone: phones?.[0]?.replace(/\D/g, '').slice(-10) || '',
        skills: foundSkills,
        text: text.slice(0, 1000), 
        experience: extractExperience(text),
        education: extractEducation(text)
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  };
  
  const extractExperience = (text) => {
    const yearRegex = /(\d+)\+?\s*years?/gi;
    const matches = text.match(yearRegex);
    return matches?.[0] || 'Not specified';
  };
  
  const extractEducation = (text) => {
    const degrees = ['Bachelor', 'Master', 'PhD', 'B.S.', 'M.S.', 'B.Tech', 'M.Tech'];
    for (const degree of degrees) {
      if (text.includes(degree)) {
        return degree + ' Degree';
      }
    }
    return 'Not specified';
  };
  
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
       
        resolve(`Sample Resume Text
  John Doe
  john.doe@email.com
  +1-234-567-8900
  Skills: React, Node.js, JavaScript, Express, MongoDB
  Experience: 5 years in software development
  Education: B.S. in Computer Science`);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };