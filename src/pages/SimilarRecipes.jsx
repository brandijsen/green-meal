import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SmallRecipeCard from "../components/SmallRecipeCard.jsx";
import { getSimilarRecipes, getRecipeInformation } from "../services/apiServices";
import useScrollToTop from "../services/utils.js";

const SimilarRecipes = () => {
  useScrollToTop()
  const location = useLocation();
  const [detailedRecipes, setDetailedRecipes] = useState(null); 
  const recipeId = location.state?.recipeId; 
  const recipeTitle = location.state?.recipeTitle; 
  useEffect(() => {
    const fetchSimilarAndDetails = async () => {
      try {
        const similarRecipes = await getSimilarRecipes(recipeId);

        if (!similarRecipes || similarRecipes.length === 0) {
          console.warn("No similar recipes found");
          setDetailedRecipes([]); 
          return;
        }

        const detailedData = await Promise.all(
          similarRecipes.map((recipe) =>
            getRecipeInformation(recipe.id).catch((err) => {
              console.error(`Error with recipe ${recipe.id}:`, err);
              return null; 
            })
          )
        );

        const vegetarianRecipes = detailedData.filter(
          (data) => data !== null && data.vegetarian
        );

        setDetailedRecipes(vegetarianRecipes);
      } catch (error) {
        console.error("Error retrieving similar recipes:", error);
        setDetailedRecipes([]); 
      }
    };

    if (recipeId) {
      fetchSimilarAndDetails(); 
    } else {
      console.error("recipeId not found!");
      setDetailedRecipes([]); 
    }
  }, [recipeId]);

  return (
      <div className="container min-h-screen flex flex-col mx-auto px-20 mt-10 mb-20" id="container">
        <h2 className="text-2xl font-bold mb-8">
          Similar recipes to "{recipeTitle}"{" "}
          {detailedRecipes && detailedRecipes.length > 0 && (
            <small className="text-red-500">({detailedRecipes.length})</small>
          )}
        </h2>
        {detailedRecipes === null ? (
          <></>
        ) : detailedRecipes.length > 0 ? (
          <div className="grid grid-cols-4 gap-20 w-full" id="recipes-grid">
          {detailedRecipes.map((recipe) => (
                <SmallRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className="text-center mt-5 text-gray-500">
            No similar recipes found for the recipe you viewed.
          </p>
        )}
      </div>
  );
};

export default SimilarRecipes;
