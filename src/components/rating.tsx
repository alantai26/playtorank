import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GamepadIcon, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RatingPage() {
  const [games, setGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [newGame, setNewGame] = useState(null);
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*');

      if (error) {
        console.error('Error fetching games:', error);
      } else {
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  const handleGameToggle = (gameId: number) => {
    setSelectedGames((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const calculateRating = (rank: number, totalGames: number): number => {
    const maxRating = 10; 
    const weight = (totalGames - rank + 1) / totalGames; 
    return parseFloat((maxRating * weight).toFixed(2));
  };
  
  const handleSubmit = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be logged in to submit your ratings.");
        return;
      }

      const userId = user.id;

      const totalGames = selectedGames.length;

      const userGamesData = selectedGames.map((gameId, index) => {
        const rank = index + 1;
        const rating = calculateRating(rank, totalGames); 
        return {
          userid: userId,
          gameid: gameId,
          rank,
          rating,
        };
      });
  
      const { error: insertError } = await supabase
        .from('user_games')
        .insert(userGamesData);

      if (insertError) {
        console.error('Error inserting data:', insertError);
        setError(insertError.message);
        return;
      }

      console.log('User games data inserted successfully:', userGamesData);
      setSuccessMessage("Games successfully submitted!");
      navigate("/rated");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleAddGame = (game) => {
    setNewGame(game);
    setIsAddGameOpen(false);
    setIsComparing(true);
    setComparisonIndex(0);
  };

  const handleComparisonChoice = (choice: string) => {
    if (choice === 'like') {
      compareWithRankedGames(newGame, 0, Math.ceil(selectedGames.length / 3));
    } else if (choice === 'fine') {
      setSelectedGames(prev => [...prev, newGame.id]);
      setIsComparing(false);
    } else {
      setIsComparing(false);
    }
  };

  const compareWithRankedGames = (game, startIndex, endIndex) => {
    if (startIndex >= endIndex) {
      setSelectedGames(prev => [...prev, game.id]);
      setIsComparing(false);
      return;
    }

    const currentComparison = games.find(g => g.id === selectedGames[startIndex]);
    setComparisonIndex(startIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="flex items-center justify-between p-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <GamepadIcon className="h-8 w-8 text-purple-500" />
          <span className="text-lg font-semibold">Play to Rank</span>
        </Link>
        <Dialog open={isAddGameOpen} onOpenChange={setIsAddGameOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1f29] text-white">
            <DialogHeader>
              <DialogTitle>Add a New Game</DialogTitle>
              <DialogDescription>
                Select a game to add to your rankings.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {games.map((game) => (
                <Button
                  key={game.id}
                  onClick={() => handleAddGame(game)}
                  className="w-full justify-start mb-2 bg-transparent hover:bg-purple-900/20"
                >
                  {game.name}
                </Button>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </nav>
      <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl">
          <Card className="border-purple-800 bg-[#1a1f29]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Select Your Games
              </CardTitle>
              <CardDescription className="text-gray-400">
                Please select at least 10 games you've played or want to rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {selectedGames.length < 10 && (
                  <Alert className="border-purple-800 bg-purple-900/20 text-white flex items-start">
                    <AlertDescription>
                      Please select {10 - selectedGames.length} more games:
                    </AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert className="border-red-800 bg-red-900/20 text-white flex items-start">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {successMessage && (
                  <Alert className="border-green-800 bg-green-900/20 text-white flex items-start">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                <ScrollArea className="h-[400px] rounded-md border border-purple-800 p-4 text-white">
                  <div className="grid gap-4 pr-4">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center space-x-4 rounded-lg border border-purple-800/40 bg-[#0f1218] p-4"
                      >
                        <Checkbox
                          id={`game-${game.id}`}
                          checked={selectedGames.includes(game.id)}
                          onCheckedChange={() => handleGameToggle(game.id)}
                          className="border-purple-600 h-5 w-5 flex items-center justify-center"
                        >
                          {selectedGames.includes(game.id) && (
                            <span className="text-xs">
                              {selectedGames.indexOf(game.id) + 1}
                            </span>
                          )}
                        </Checkbox>
                        <div className="flex flex-col">
                          <label
                            htmlFor={`game-${game.id}`}
                            className="text-white"
                          >
                            {game.name}
                          </label>
                          <span className="text-gray-400 text-sm">
                            {game.genre}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {selectedGames.length >= 10 && (
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      {isComparing && newGame && (
        <Dialog open={isComparing} onOpenChange={setIsComparing}>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1f29] text-white">
            <DialogHeader>
              <DialogTitle>Rate New Game</DialogTitle>
              <DialogDescription>
                How did you enjoy {newGame.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button onClick={() => handleComparisonChoice('like')} className="bg-green-600 hover:bg-green-700">
                I liked it!
              </Button>
              <Button onClick={() => handleComparisonChoice('fine')} className="bg-yellow-600 hover:bg-yellow-700">
                I thought it was fine.
              </Button>
              <Button onClick={() => handleComparisonChoice('dislike')} className="bg-red-600 hover:bg-red-700">
                I did not like it.
              </Button>
            </div>
            {comparisonIndex < Math.ceil(selectedGames.length / 3) && (
              <p className="text-center mt-4">
                Do you like {newGame.name} more than {games.find(g => g.id === selectedGames[comparisonIndex])?.name}?
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

