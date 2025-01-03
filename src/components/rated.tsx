import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GamepadIcon, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RatedPage() {
  const [ratedGames, setRatedGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [newGame, setNewGame] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [comparisonGames, setComparisonGames] = useState([]);
  const [isRatingChoiceOpen, setIsRatingChoiceOpen] = useState(false);

  useEffect(() => {
    const fetchRatedGames = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          console.error("User not authenticated");
          setLoading(false);
          return;
        }

        const { data: userGames, error: userGamesError } = await supabase
          .from("user_games")
          .select("rank, rating, gameid")
          .eq("userid", user.id)
          .order("rank", { ascending: true });

        if (userGamesError) throw userGamesError;

        if (userGames.length === 0) {
          console.log("No games found for user");
          setLoading(false);
          return;
        }

        const gameIds = userGames.map((item) => item.gameid);

        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("id, name, genre")
          .in("id", gameIds);

        if (gamesError) throw gamesError;

        const combinedData = userGames.map((userGame) => {
          const gameDetails = gamesData.find(
            (game) => game.id === userGame.gameid
          );
          return {
            rank: userGame.rank,
            rating: userGame.rating,
            name: gameDetails?.name || "Unknown",
            genre: gameDetails?.genre || "Unknown",
          };
        });

        setRatedGames(combinedData);
      } catch (error) {
        console.error("Error fetching rated games:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllGames = async () => {
      try {
        const { data, error } = await supabase.from("games").select("*");
        if (error) throw error;
        setAllGames(data);
      } catch (error) {
        console.error("Error fetching all games:", error);
      }
    };

    fetchRatedGames();
    fetchAllGames();
  }, []);

  const handleAddGame = async (game) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated");
      return;
    }

    const { data: existingGame, error: fetchError } = await supabase
      .from("user_games")
      .select("id")
      .eq("userid", user.id)
      .eq("gameid", game.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking for duplicate game:", fetchError.message);
      return;
    }

    if (existingGame) {
      console.log("This game already exists for the user. Skipping addition.");
      return;
    }

    setNewGame(game);
    setIsAddGameOpen(false);
    setIsRatingChoiceOpen(true);
  };

  const handleRatingChoice = (choice) => {
    if (!newGame) return;
  
    let comparisonStart = 0;
    let comparisonEnd = ratedGames.length;
  
    
    if (choice === "like") {
      comparisonEnd = Math.ceil(ratedGames.length / 3); 
    } else if (choice === "fine") {
      comparisonStart = Math.ceil(ratedGames.length / 3);
      comparisonEnd = Math.ceil((ratedGames.length * 2) / 3); 
    } else if (choice === "dislike") {
      comparisonStart = Math.ceil((ratedGames.length * 2) / 3); 
    }
  
 
    setComparisonGames(ratedGames.slice(comparisonStart, comparisonEnd));
    setComparisonIndex(comparisonStart); 
    setIsComparing(true);
    setIsRatingChoiceOpen(false);
  };
  
  const handleComparison = (isBetter) => {
    if (!comparisonGames || comparisonGames.length === 0) return;
  
 
    const globalIndex = comparisonIndex;
  
    if (isBetter) {
 
      addGameToRankings(newGame, globalIndex);
      setIsComparing(false);
    } else if (globalIndex < comparisonGames[comparisonGames.length - 1]?.rank - 1) {
    
      setComparisonIndex(globalIndex + 1);
    } else {
    
      addGameToRankings(newGame, comparisonGames[comparisonGames.length - 1]?.rank);
      setIsComparing(false);
    }
  };
  
  const addGameToRankings = async (game, position) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }
  
      const newRank = position + 1;
      const updatedRatedGames = [...ratedGames];
      updatedRatedGames.splice(position, 0, {
        rank: newRank,
        rating: calculateRating(newRank, updatedRatedGames.length + 1),
        name: game.name,
        genre: game.genre,
      });
  
      
      for (let i = position + 1; i < updatedRatedGames.length; i++) {
        updatedRatedGames[i].rank = i + 1;
        updatedRatedGames[i].rating = calculateRating(i + 1, updatedRatedGames.length);
      }
  
      setRatedGames(updatedRatedGames);
  
      const { error } = await supabase.from("user_games").upsert(
        updatedRatedGames.map((g, index) => ({
          userid: user.id,
          gameid: allGames.find(ag => ag.name === g.name)?.id,
          rank: index + 1,
          rating: g.rating,
        }))
      );
  
      if (error) throw error;
    } catch (error) {
      console.error("Error updating rankings:", error);
    }
  };
  

  const calculateRating = (rank, totalGames) => {
    const maxRating = 10;
    const weight = (totalGames - rank + 1) / totalGames;
    return parseFloat((maxRating * weight).toFixed(2));
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
              {allGames.map((game) => (
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

      {isRatingChoiceOpen && (
        <Dialog open={isRatingChoiceOpen} onOpenChange={setIsRatingChoiceOpen}>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1f29] text-white">
            <DialogHeader>
              <DialogTitle>Rate New Game</DialogTitle>
              <DialogDescription>
                How did you enjoy {newGame?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button onClick={() => handleRatingChoice("like")} className="bg-green-600 hover:bg-green-700">
                I liked it!
              </Button>
              <Button onClick={() => handleRatingChoice("fine")} className="bg-yellow-600 hover:bg-yellow-700">
                I thought it was fine.
              </Button>
              <Button onClick={() => handleRatingChoice("dislike")} className="bg-red-600 hover:bg-red-700">
                I did not like it.
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isComparing && (
        <Dialog open={isComparing} onOpenChange={setIsComparing}>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1f29] text-white">
            <DialogHeader>
              <DialogTitle>Compare New Game</DialogTitle>
              <DialogDescription>
                Do you like {newGame?.name} more than {comparisonGames[comparisonIndex]?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between mt-4">
              <Button onClick={() => handleComparison(true)} className="bg-green-600 hover:bg-green-700">
                Yes
              </Button>
              <Button onClick={() => handleComparison(false)} className="bg-red-600 hover:bg-red-700">
                No
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl">
          <Card className="border-purple-800 bg-[#1a1f29]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Ranked Games</CardTitle>
              <CardDescription className="text-gray-400">
                Here are your ranked games
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-purple-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Rank</TableHead>
                      <TableHead className="text-gray-400">Rating</TableHead>
                      <TableHead className="text-gray-400">Game</TableHead>
                      <TableHead className="text-gray-400">Genre</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratedGames.map((game, index) => (
                      <TableRow
                        key={index}
                        className="border-purple-800 hover:bg-purple-900/20"
                      >
                        <TableCell className="font-medium text-white">
                          {game.rank}
                        </TableCell>
                        <TableCell className="text-white">
                          {game.rating.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-white">{game.name}</TableCell>
                        <TableCell className="text-gray-300">{game.genre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
