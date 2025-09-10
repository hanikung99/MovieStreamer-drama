import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[] = []) {
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section that's most visible
        let maxVisibility = 0;
        let mostVisibleSection = 'home';

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            mostVisibleSection = entry.target.id;
          }
        });

        // Only update if we found a visible section
        if (maxVisibility > 0) {
          setActiveSection(mostVisibleSection);
        }
      },
      {
        // Trigger when 30% of the section is visible
        threshold: [0.3],
        // Add some margin to trigger earlier
        rootMargin: '-20% 0px -20% 0px',
      }
    );

    // Observe all sections
    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return activeSection;
}

// Alternative hook for manual scroll detection
export function useScrollActiveSection(sectionIds: string[] = []) {
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      let currentSection = 'home';
      
      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = sectionId;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    // Initial check
    handleScroll();

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds]);

  return activeSection;
}
