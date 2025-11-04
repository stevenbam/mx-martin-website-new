const db = require('./db');

const seedData = async () => {
  try {
    console.log('Seeding database with initial data...');

    // Seed Songs
    const songs = [
      {
        title: 'The Shape of Things to Come',
        file_path: '/songs/The Shape of Things to Come.wav'
      },
      {
        title: 'Mood Swings',
        file_path: '/songs/Mood Swings.m4a'
      }
    ];

    for (const song of songs) {
      await db.query(
        'INSERT INTO songs (title, file_path) VALUES (?, ?)',
        [song.title, song.file_path]
      );
    }
    console.log('✓ Songs seeded');

    // Seed Lyrics
    const lyrics = [
      {
        title: 'The Shape of Things to Come',
        lyrics: `Verse 1:
Looking through the window
Into tomorrow's light
Everything is changing
Nothing stays the same

Chorus:
This is the shape of things to come
A new world has begun
Can you feel it in the air?
The future's everywhere

Verse 2:
Walking through the shadows
Of yesterday's dreams
Moving ever forward
Nothing's as it seems`
      },
      {
        title: 'Mood Swings',
        lyrics: `Verse 1:
Up and down like a rollercoaster
Feeling high then feeling low
Never know what's coming next
Just gotta let it flow

Chorus:
These mood swings got me spinning around
Feet can't touch the ground
One minute I'm flying high
Next minute I wonder why

Verse 2:
Colors changing every moment
From darkness into light
Riding waves of emotion
Through the day and night`
      }
    ];

    for (const lyric of lyrics) {
      await db.query(
        'INSERT INTO lyrics (title, lyrics) VALUES (?, ?)',
        [lyric.title, lyric.lyrics]
      );
    }
    console.log('✓ Lyrics seeded');

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
