import React, { useState, useEffect } from 'react';
import { Joyride, Step, STATUS } from 'react-joyride';
import { UserProfile } from '../types';
import { db, doc, updateDoc } from '../firebase';

export default function GuidedTour({ user }: { user: UserProfile }) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour
    if (!user.completedTour) {
      setRun(true);
    }
  }, [user.completedTour]);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to EconQuest! Let\'s take a quick tour to get you started.',
      placement: 'center',
    },
    {
      target: '[data-tour="dashboard"]',
      content: 'This is your Dashboard. Track your XP, coins, and daily focus here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="quests"]',
      content: 'Ready to learn? Head to the Quest Arena to choose your learning path.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="recommended"]',
      content: 'We\'ve picked a quest just for you based on your progress. Start here!',
      placement: 'bottom',
    },
    {
      target: '[data-tour="stats"]',
      content: 'Keep an eye on your stats. Level up to unlock new ranks and rewards.',
      placement: 'bottom',
    },
  ];

  const handleJoyrideCallback = async (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      // Mark tour as completed in Firestore
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          completedTour: true
        });
      } catch (error) {
        console.error("Error updating tour status:", error);
      }
    }
  };

  return (
    <Joyride
      {...{
        steps,
        run,
        continuous: true,
        showProgress: true,
        showSkipButton: true,
        callback: handleJoyrideCallback,
        styles: {
          options: {
            primaryColor: '#fac415',
            zIndex: 1000,
          }
        }
      } as any}
    />
  );
}
