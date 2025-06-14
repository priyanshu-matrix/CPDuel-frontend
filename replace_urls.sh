#!/bin/bash

# Script to replace all hardcoded backend URLs with centralized API_URLS configuration

echo "🚀 Starting URL replacement script..."

# List of files to update
FILES=(
    "src/pages/ContestStartPage.tsx"
    "src/components/ViewQuestionComponent.tsx"  
    "src/components/Navbar.jsx"
    "src/components/CreateContest.jsx"
    "src/components/ContestList.jsx"
    "src/components/CreateProblem.jsx"
    "src/components/ContestCard.jsx"
    "src/components/Signup.jsx"
)

# Function to add import if not exists
add_import() {
    local file="$1"
    if ! grep -q "API_URLS.*from.*config/server" "$file"; then
        echo "  ➕ Adding API_URLS import to $file"
        # Add import after last existing import
        sed -i '' '/^import.*from.*["\'];$/a\
import { API_URLS } from "../config/server";
' "$file"
    else
        echo "  ✅ $file already has API_URLS import"
    fi
}

# Function to replace URLs
replace_urls() {
    local file="$1"
    echo "  🔄 Replacing URLs in $file"
    
    # User endpoints
    sed -i '' 's|"http://localhost:3000/api/users/signup"|API_URLS.USERS.SIGNUP|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/signup'|API_URLS.USERS.SIGNUP|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/signup`|API_URLS.USERS.SIGNUP|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/users/login"|API_URLS.USERS.LOGIN|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/login'|API_URLS.USERS.LOGIN|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/login`|API_URLS.USERS.LOGIN|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/users/info"|API_URLS.USERS.INFO|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/info'|API_URLS.USERS.INFO|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/info`|API_URLS.USERS.INFO|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/users/all"|API_URLS.USERS.ALL|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/all'|API_URLS.USERS.ALL|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/all`|API_URLS.USERS.ALL|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/users/getUserByUid"|API_URLS.USERS.GET_BY_UID|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/getUserByUid'|API_URLS.USERS.GET_BY_UID|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/getUserByUid`|API_URLS.USERS.GET_BY_UID|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/users/changeUserStatus"|API_URLS.USERS.CHANGE_STATUS|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/changeUserStatus'|API_URLS.USERS.CHANGE_STATUS|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/changeUserStatus`|API_URLS.USERS.CHANGE_STATUS|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/users/registerContest"|API_URLS.USERS.REGISTER_CONTEST|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/users/registerContest'|API_URLS.USERS.REGISTER_CONTEST|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/users/registerContest`|API_URLS.USERS.REGISTER_CONTEST|g' "$file"
    
    # Contest endpoints
    sed -i '' 's|"http://localhost:3000/api/contests/add"|API_URLS.CONTESTS.ADD|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/add'|API_URLS.CONTESTS.ADD|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/add`|API_URLS.CONTESTS.ADD|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/contests/getall"|API_URLS.CONTESTS.GET_ALL|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/getall'|API_URLS.CONTESTS.GET_ALL|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/getall`|API_URLS.CONTESTS.GET_ALL|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/contests/addProblemToContest"|API_URLS.CONTESTS.ADD_PROBLEM|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/addProblemToContest'|API_URLS.CONTESTS.ADD_PROBLEM|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/addProblemToContest`|API_URLS.CONTESTS.ADD_PROBLEM|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/contests/removeProblemFromContest"|API_URLS.CONTESTS.REMOVE_PROBLEM|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/removeProblemFromContest'|API_URLS.CONTESTS.REMOVE_PROBLEM|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/removeProblemFromContest`|API_URLS.CONTESTS.REMOVE_PROBLEM|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/contests/getUserMatchInfo"|API_URLS.CONTESTS.GET_USER_MATCH_INFO|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/getUserMatchInfo'|API_URLS.CONTESTS.GET_USER_MATCH_INFO|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/getUserMatchInfo`|API_URLS.CONTESTS.GET_USER_MATCH_INFO|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/contests/startContest"|API_URLS.CONTESTS.START_CONTEST|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/startContest'|API_URLS.CONTESTS.START_CONTEST|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/startContest`|API_URLS.CONTESTS.START_CONTEST|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/contests/updateMatchWinner"|API_URLS.CONTESTS.UPDATE_MATCH_WINNER|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/contests/updateMatchWinner'|API_URLS.CONTESTS.UPDATE_MATCH_WINNER|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/updateMatchWinner`|API_URLS.CONTESTS.UPDATE_MATCH_WINNER|g' "$file"
    
    # Problem endpoints
    sed -i '' 's|"http://localhost:3000/api/problems/add"|API_URLS.PROBLEMS.ADD|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/problems/add'|API_URLS.PROBLEMS.ADD|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/problems/add`|API_URLS.PROBLEMS.ADD|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/problems/getall"|API_URLS.PROBLEMS.GET_ALL|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/problems/getall'|API_URLS.PROBLEMS.GET_ALL|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/problems/getall`|API_URLS.PROBLEMS.GET_ALL|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/problems/get"|API_URLS.PROBLEMS.GET|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/problems/get'|API_URLS.PROBLEMS.GET|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/problems/get`|API_URLS.PROBLEMS.GET|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/problems/edit"|API_URLS.PROBLEMS.EDIT|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/problems/edit'|API_URLS.PROBLEMS.EDIT|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/problems/edit`|API_URLS.PROBLEMS.EDIT|g' "$file"
    
    sed -i '' 's|"http://localhost:3000/api/problems/delete"|API_URLS.PROBLEMS.DELETE|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/problems/delete'|API_URLS.PROBLEMS.DELETE|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/problems/delete`|API_URLS.PROBLEMS.DELETE|g' "$file"
    
    # Compiler endpoints  
    sed -i '' 's|"http://localhost:3000/api/compiler/submitCode"|API_URLS.COMPILER.SUBMIT_CODE|g' "$file"
    sed -i '' "s|'http://localhost:3000/api/compiler/submitCode'|API_URLS.COMPILER.SUBMIT_CODE|g" "$file"
    sed -i '' 's|`http://localhost:3000/api/compiler/submitCode`|API_URLS.COMPILER.SUBMIT_CODE|g' "$file"
}

# Function to handle dynamic URLs with template literals
replace_dynamic_urls() {
    local file="$1"
    echo "  🔧 Replacing dynamic URLs in $file"
    
    # Handle template literals with variables
    sed -i '' 's|`http://localhost:3000/api/contests/getcon/\${[^}]*}`|API_URLS.CONTESTS.GET_BY_ID(\${contestId})|g' "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/edit/\${[^}]*}`|API_URLS.CONTESTS.EDIT(\${contest._id})|g' "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/delete/\${[^}]*}`|API_URLS.CONTESTS.DELETE(\${contest._id})|g' "$file"
    sed -i '' 's|`http://localhost:3000/api/contests/getContestProblems/\${[^}]*}`|API_URLS.CONTESTS.GET_CONTEST_PROBLEMS(\${contestId})|g' "$file"
    sed -i '' 's|`http://localhost:3000/api/users/checkContestRegistration/\${[^}]*}`|API_URLS.USERS.CHECK_CONTEST_REGISTRATION(\${contestIdentifier})|g' "$file"
}

# Main execution
echo "📁 Processing files..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🔍 Processing: $file"
        
        # Add import
        add_import "$file"
        
        # Replace URLs
        replace_urls "$file"
        replace_dynamic_urls "$file"
        
        echo "  ✅ Completed: $file"
    else
        echo "  ⚠️  File not found: $file"
    fi
done

echo ""
echo "🎉 URL replacement completed!"
echo ""
echo "📋 Summary of changes:"
echo "  • Added API_URLS imports to components"
echo "  • Replaced hardcoded API URLs with centralized config"
echo "  • Handled dynamic URLs with parameters"
echo ""
echo "🧪 Next steps:"
echo "  1. Test the application: npm run dev"
echo "  2. Check for any compilation errors"
echo "  3. Verify API calls work correctly"
echo ""
