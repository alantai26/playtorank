import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GamepadIcon, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const SUPABASE_PROJECT_ID = "bcqrezetbqornuuadcer"
const SUPABASE_STORAGE_BUCKET = "bukcket"

export default function RatedPage() {
  const [ratedGames, setRatedGames] = useState([])
  const [allGames, setAllGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const [newGame, setNewGame] = useState(null)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonIndex, setComparisonIndex] = useState(0)
  const [comparisonGames, setComparisonGames] = useState([])
  const [userFeedback, setUserFeedback] = useState(null)
  const [lowerBound, setLowerBound] = useState(0)
  const [upperBound, setUpperBound] = useState(0)
  const [isRemovalMode, setIsRemovalMode] = useState(false)
  const [selectedGames, setSelectedGames] = useState([])

  const getSupabaseImageUrl = (path) => {
    if (!path) return "/placeholder.svg"
    const baseUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co`
    return `${baseUrl}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${path}`
  }

  useEffect(() => {
    const fetchRatedGames = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError

        if (!user) {
          console.error("User not authenticated")
          setLoading(false)
          return
        }

        const { data: userGames, error: userGamesError } = await supabase
          .from("user_games")
          .select("rank, rating, gameid")
          .eq("userid", user.id)
          .order("rank", { ascending: true })

        if (userGamesError) throw userGamesError

        const gameIds = userGames.map((item) => item.gameid)

        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("id, name, genre, image_url")
          .in("id", gameIds)

        if (gamesError) throw gamesError

        const combinedData = userGames.map((userGame) => {
          const gameDetails = gamesData.find((game) => game.id === userGame.gameid)
          return {
            rank: userGame.rank,
            rating: userGame.rating,
            name: gameDetails?.name || "Unknown",
            genre: gameDetails?.genre || "Unknown",
            imageUrl: getSupabaseImageUrl(gameDetails?.image_url),
          }
        })

        setRatedGames(combinedData)
      } catch (error) {
        console.error("Error fetching rated games:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchAllGames = async () => {
      try {
        const { data, error } = await supabase.from("games").select("*")
        if (error) throw error
        setAllGames(
          data.map((game) => ({
            ...game,
            image_url: getSupabaseImageUrl(game.image_url),
          })),
        )
      } catch (error) {
        console.error("Error fetching all games:", error)
      }
    }

    fetchRatedGames()
    fetchAllGames()
  }, [])

  const handleAddGame = (game) => {
    setNewGame(game)
    setUserFeedback(null)
    setIsComparing(false)
    setLowerBound(0)
    setUpperBound(ratedGames.length - 1)
  }

  const handleInitialFeedback = (feedback) => {
    setUserFeedback(feedback)

    const thirdLength = Math.floor(ratedGames.length / 3)
    let startIndex

    if (feedback === "enjoyed it") {
      startIndex = Math.floor(thirdLength / 2)
      setLowerBound(0)
      setUpperBound(thirdLength - 1)
    } else if (feedback === "thought it was ok") {
      startIndex = Math.floor(thirdLength + thirdLength / 2)
      setLowerBound(thirdLength)
      setUpperBound(thirdLength * 2 - 1)
    } else {
      startIndex = Math.floor(thirdLength * 2 + (ratedGames.length - thirdLength * 2) / 2)
      setLowerBound(thirdLength * 2)
      setUpperBound(ratedGames.length - 1)
    }

    setComparisonGames(ratedGames)
    setComparisonIndex(startIndex)
    setIsComparing(true)
  }

  const handleComparison = (isBetter) => {
    if (isBetter) {
      setUpperBound(comparisonIndex - 1)
    } else {
      setLowerBound(comparisonIndex + 1)
    }

    if (lowerBound > upperBound) {
      const insertPosition = lowerBound
      addGameToRankings(newGame, insertPosition)
      setIsComparing(false)
      setNewGame(null)
      return
    }

    const newMid = Math.ceil((lowerBound + upperBound) / 2)
    setComparisonIndex(newMid)
  }

  const addGameToRankings = async (game, position) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error("User not authenticated")
        return
      }

      const updatedRatedGames = [...ratedGames]
      updatedRatedGames.splice(position, 0, {
        rank: position + 1,
        rating: calculateRating(position + 1, ratedGames.length + 1),
        name: game.name,
        genre: game.genre,
        imageUrl: game.image_url,
      })
      for (let i = 0; i < updatedRatedGames.length; i++) {
        updatedRatedGames[i].rank = i + 1
        updatedRatedGames[i].rating = calculateRating(i + 1, updatedRatedGames.length)
      }

      setRatedGames(updatedRatedGames)

      const upsertData = updatedRatedGames.map((g, index) => ({
        userid: user.id,
        gameid: allGames.find((ag) => ag.name === g.name)?.id,
        rank: index + 1,
        rating: g.rating,
      }))

      const { error: dbError } = await supabase
        .from("user_games")
        .upsert(upsertData, { onConflict: "userid,gameid" })

      if (dbError) {
        console.error("Error updating rankings in the database:", dbError.message)
      }
    } catch (error) {
      console.error("Error updating rankings:", error.message)
    }
  }

  const calculateRating = (rank, totalGames) => {
    const maxRating = 10
    const weight = (totalGames - rank + 1) / totalGames
    return Number.parseFloat((maxRating * weight).toFixed(2))
  }

  const handleConfirmRemoval = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error("User not authenticated")
        return
      }

    
      const gameIdsToRemove = allGames.filter((game) => selectedGames.includes(game.name)).map((game) => game.id)

      const { error: deleteError } = await supabase
        .from("user_games")
        .delete()
        .eq("userid", user.id)
        .in("gameid", gameIdsToRemove)

      if (deleteError) throw deleteError


      const updatedGames = ratedGames.filter((game) => !selectedGames.includes(game.name))

      const finalGames = updatedGames.map((game, index) => ({
        ...game,
        rank: index + 1,
        rating: calculateRating(index + 1, updatedGames.length),
      }))

      setRatedGames(finalGames)
      setSelectedGames([])
      setIsRemovalMode(false)

      const upsertData = finalGames.map((g, index) => ({
        userid: user.id,
        gameid: allGames.find((ag) => ag.name === g.name)?.id,
        rank: index + 1,
        rating: g.rating,
      }))

      const { error: upsertError } = await supabase
        .from("user_games")
        .upsert(upsertData, { onConflict: "userid,gameid" })

      if (upsertError) throw upsertError
    } catch (error) {
      console.error("Error removing games:", error)
    }
  }

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
              <DialogDescription>Select a game to add to your rankings.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {allGames.map((game) => (
                <Button
                  key={game.id}
                  onClick={() => handleAddGame(game)}
                  className="w-full justify-start mb-2 bg-transparent hover:bg-purple-900/20 flex items-center"
                >
                  <img
                    src={game.image_url || "/placeholder.svg"}
                    alt={`${game.name} logo`}
                    width={32}
                    height={32}
                    className="object-contain mr-2"
                  />
                  {game.name}
                </Button>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </nav>

      {newGame && !isComparing && userFeedback === null && (
        <Dialog open={newGame !== null} onOpenChange={() => setNewGame(null)}>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1f29] text-white">
            <DialogHeader>
              <DialogTitle>How did you feel about {newGame?.name}?</DialogTitle>
            </DialogHeader>
            <div className="flex justify-around mt-4">
              <Button
                onClick={() => handleInitialFeedback("enjoyed it")}
                className="bg-green-600 hover:bg-green-700 px-4"
              >
                Enjoyed It
              </Button>
              <Button
                onClick={() => handleInitialFeedback("thought it was ok")}
                className="bg-yellow-600 hover:bg-yellow-700 px-4"
              >
                Thought It Was OK
              </Button>
              <Button
                onClick={() => handleInitialFeedback("did not like it")}
                className="bg-red-600 hover:bg-red-700 px-4"
              >
                Did Not Like It
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isComparing && (
        <Dialog open={isComparing} onOpenChange={() => setIsComparing(false)}>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1f29] text-white">
            <DialogHeader>
              <DialogTitle>Compare Game</DialogTitle>
              <DialogDescription>
                Do you like {newGame?.name} more than {comparisonGames[comparisonIndex]?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between items-center mt-4">
              <div className="text-center">
                <img
                  src={newGame?.image_url || "/placeholder.svg"}
                  alt={`${newGame?.name} logo`}
                  width={64}
                  height={64}
                  className="object-contain mx-auto mb-2"
                />
                <p>{newGame?.name}</p>
              </div>
              <div className="text-2xl font-bold">VS</div>
              <div className="text-center">
                <img
                  src={comparisonGames[comparisonIndex]?.imageUrl || "/placeholder.svg"}
                  alt={`${comparisonGames[comparisonIndex]?.name} logo`}
                  width={64}
                  height={64}
                  className="object-contain mx-auto mb-2"
                />
                <p>{comparisonGames[comparisonIndex]?.name}</p>
              </div>
            </div>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white">Ranked Games</CardTitle>
                <div className="flex gap-2">
                  {isRemovalMode ? (
                    <Button
                      onClick={handleConfirmRemoval}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm Remove ({selectedGames.length})
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsRemovalMode(true)}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600/10"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription className="text-gray-400">Here are your ranked games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-purple-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Game</TableHead>
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Rank</TableHead>
                      <TableHead className="text-gray-400">Rating</TableHead>
                      <TableHead className="text-gray-400">Genre</TableHead>
                      {isRemovalMode && <TableHead className="text-gray-400 w-[50px]" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratedGames.map((game, index) => (
                      <TableRow key={index} className="border-purple-800 hover:bg-purple-900/20">
                        <TableCell>
                          <img
                            src={game.imageUrl || "/placeholder.svg"}
                            alt={`${game.name} logo`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </TableCell>
                        <TableCell className="text-white">{game.name}</TableCell>
                        <TableCell className="font-medium text-white">{game.rank}</TableCell>
                        <TableCell className="text-white">{game.rating.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-300">{game.genre}</TableCell>
                        {isRemovalMode && (
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedGames.includes(game.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGames([...selectedGames, game.name])
                                } else {
                                  setSelectedGames(selectedGames.filter((name) => name !== game.name))
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                            />
                          </TableCell>
                        )}
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
  )
}

