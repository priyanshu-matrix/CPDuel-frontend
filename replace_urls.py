#!/usr/bin/env python3

import os
import re
import sys

def add_import_if_needed(content, filepath):
    """Add API_URLS import if not already present"""
    if 'API_URLS' in content and 'from "../config/server"' not in content:
        # Find the last import statement
        import_pattern = r'^import.*from.*["\'];?$'
        lines = content.split('\n')
        last_import_index = -1
        
        for i, line in enumerate(lines):
            if re.match(import_pattern, line.strip()):
                last_import_index = i
        
        if last_import_index >= 0:
            # Insert the new import after the last import
            lines.insert(last_import_index + 1, 'import { API_URLS } from "../config/server";')
            content = '\n'.join(lines)
            print(f"  ➕ Added API_URLS import to {filepath}")
        else:
            print(f"  ⚠️  Could not find import section in {filepath}")
    
    return content

def replace_urls(content, filepath):
    """Replace hardcoded URLs with API_URLS references"""
    replacements = {
        # User endpoints
        '"http://localhost:3000/api/users/signup"': 'API_URLS.USERS.SIGNUP',
        "'http://localhost:3000/api/users/signup'": 'API_URLS.USERS.SIGNUP',
        '`http://localhost:3000/api/users/signup`': 'API_URLS.USERS.SIGNUP',
        
        '"http://localhost:3000/api/users/login"': 'API_URLS.USERS.LOGIN',
        "'http://localhost:3000/api/users/login'": 'API_URLS.USERS.LOGIN',
        '`http://localhost:3000/api/users/login`': 'API_URLS.USERS.LOGIN',
        
        '"http://localhost:3000/api/users/info"': 'API_URLS.USERS.INFO',
        "'http://localhost:3000/api/users/info'": 'API_URLS.USERS.INFO',
        '`http://localhost:3000/api/users/info`': 'API_URLS.USERS.INFO',
        
        '"http://localhost:3000/api/users/all"': 'API_URLS.USERS.ALL',
        "'http://localhost:3000/api/users/all'": 'API_URLS.USERS.ALL',
        '`http://localhost:3000/api/users/all`': 'API_URLS.USERS.ALL',
        
        '"http://localhost:3000/api/users/getUserByUid"': 'API_URLS.USERS.GET_BY_UID',
        "'http://localhost:3000/api/users/getUserByUid'": 'API_URLS.USERS.GET_BY_UID',
        '`http://localhost:3000/api/users/getUserByUid`': 'API_URLS.USERS.GET_BY_UID',
        
        '"http://localhost:3000/api/users/changeUserStatus"': 'API_URLS.USERS.CHANGE_STATUS',
        "'http://localhost:3000/api/users/changeUserStatus'": 'API_URLS.USERS.CHANGE_STATUS',
        '`http://localhost:3000/api/users/changeUserStatus`': 'API_URLS.USERS.CHANGE_STATUS',
        
        '"http://localhost:3000/api/users/registerContest"': 'API_URLS.USERS.REGISTER_CONTEST',
        "'http://localhost:3000/api/users/registerContest'": 'API_URLS.USERS.REGISTER_CONTEST',
        '`http://localhost:3000/api/users/registerContest`': 'API_URLS.USERS.REGISTER_CONTEST',
        
        # Contest endpoints
        '"http://localhost:3000/api/contests/add"': 'API_URLS.CONTESTS.ADD',
        "'http://localhost:3000/api/contests/add'": 'API_URLS.CONTESTS.ADD',
        '`http://localhost:3000/api/contests/add`': 'API_URLS.CONTESTS.ADD',
        
        '"http://localhost:3000/api/contests/getall"': 'API_URLS.CONTESTS.GET_ALL',
        "'http://localhost:3000/api/contests/getall'": 'API_URLS.CONTESTS.GET_ALL',
        '`http://localhost:3000/api/contests/getall`': 'API_URLS.CONTESTS.GET_ALL',
        
        '"http://localhost:3000/api/contests/addProblemToContest"': 'API_URLS.CONTESTS.ADD_PROBLEM',
        "'http://localhost:3000/api/contests/addProblemToContest'": 'API_URLS.CONTESTS.ADD_PROBLEM',
        '`http://localhost:3000/api/contests/addProblemToContest`': 'API_URLS.CONTESTS.ADD_PROBLEM',
        
        '"http://localhost:3000/api/contests/removeProblemFromContest"': 'API_URLS.CONTESTS.REMOVE_PROBLEM',
        "'http://localhost:3000/api/contests/removeProblemFromContest'": 'API_URLS.CONTESTS.REMOVE_PROBLEM',
        '`http://localhost:3000/api/contests/removeProblemFromContest`': 'API_URLS.CONTESTS.REMOVE_PROBLEM',
        
        '"http://localhost:3000/api/contests/getUserMatchInfo"': 'API_URLS.CONTESTS.GET_USER_MATCH_INFO',
        "'http://localhost:3000/api/contests/getUserMatchInfo'": 'API_URLS.CONTESTS.GET_USER_MATCH_INFO',
        '`http://localhost:3000/api/contests/getUserMatchInfo`': 'API_URLS.CONTESTS.GET_USER_MATCH_INFO',
        
        '"http://localhost:3000/api/contests/startContest"': 'API_URLS.CONTESTS.START_CONTEST',
        "'http://localhost:3000/api/contests/startContest'": 'API_URLS.CONTESTS.START_CONTEST',
        '`http://localhost:3000/api/contests/startContest`': 'API_URLS.CONTESTS.START_CONTEST',
        
        '"http://localhost:3000/api/contests/updateMatchWinner"': 'API_URLS.CONTESTS.UPDATE_MATCH_WINNER',
        "'http://localhost:3000/api/contests/updateMatchWinner'": 'API_URLS.CONTESTS.UPDATE_MATCH_WINNER',
        '`http://localhost:3000/api/contests/updateMatchWinner`': 'API_URLS.CONTESTS.UPDATE_MATCH_WINNER',
        
        # Problem endpoints
        '"http://localhost:3000/api/problems/add"': 'API_URLS.PROBLEMS.ADD',
        "'http://localhost:3000/api/problems/add'": 'API_URLS.PROBLEMS.ADD',
        '`http://localhost:3000/api/problems/add`': 'API_URLS.PROBLEMS.ADD',
        
        '"http://localhost:3000/api/problems/getall"': 'API_URLS.PROBLEMS.GET_ALL',
        "'http://localhost:3000/api/problems/getall'": 'API_URLS.PROBLEMS.GET_ALL',
        '`http://localhost:3000/api/problems/getall`': 'API_URLS.PROBLEMS.GET_ALL',
        
        '"http://localhost:3000/api/problems/get"': 'API_URLS.PROBLEMS.GET',
        "'http://localhost:3000/api/problems/get'": 'API_URLS.PROBLEMS.GET',
        '`http://localhost:3000/api/problems/get`': 'API_URLS.PROBLEMS.GET',
        
        '"http://localhost:3000/api/problems/edit"': 'API_URLS.PROBLEMS.EDIT',
        "'http://localhost:3000/api/problems/edit'": 'API_URLS.PROBLEMS.EDIT',
        '`http://localhost:3000/api/problems/edit`': 'API_URLS.PROBLEMS.EDIT',
        
        '"http://localhost:3000/api/problems/delete"': 'API_URLS.PROBLEMS.DELETE',
        "'http://localhost:3000/api/problems/delete'": 'API_URLS.PROBLEMS.DELETE',
        '`http://localhost:3000/api/problems/delete`': 'API_URLS.PROBLEMS.DELETE',
        
        # Compiler endpoints
        '"http://localhost:3000/api/compiler/submitCode"': 'API_URLS.COMPILER.SUBMIT_CODE',
        "'http://localhost:3000/api/compiler/submitCode'": 'API_URLS.COMPILER.SUBMIT_CODE',
        '`http://localhost:3000/api/compiler/submitCode`': 'API_URLS.COMPILER.SUBMIT_CODE',
    }
    
    original_content = content
    
    # Replace simple URLs
    for old_url, new_url in replacements.items():
        content = content.replace(old_url, new_url)
    
    # Handle dynamic URLs with template literals
    dynamic_patterns = [
        (r'`http://localhost:3000/api/contests/getcon/\$\{([^}]+)\}`', r'API_URLS.CONTESTS.GET_BY_ID(\1)'),
        (r'`http://localhost:3000/api/contests/edit/\$\{([^}]+)\}`', r'API_URLS.CONTESTS.EDIT(\1)'),
        (r'`http://localhost:3000/api/contests/delete/\$\{([^}]+)\}`', r'API_URLS.CONTESTS.DELETE(\1)'),
        (r'`http://localhost:3000/api/contests/getContestProblems/\$\{([^}]+)\}`', r'API_URLS.CONTESTS.GET_CONTEST_PROBLEMS(\1)'),
        (r'`http://localhost:3000/api/users/checkContestRegistration/\$\{([^}]+)\}`', r'API_URLS.USERS.CHECK_CONTEST_REGISTRATION(\1)'),
    ]
    
    for pattern, replacement in dynamic_patterns:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        print(f"  🔄 Replaced URLs in {filepath}")
        return content
    else:
        print(f"  ✅ No URLs to replace in {filepath}")
        return content

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace URLs first
        content = replace_urls(content, filepath)
        
        # Add import if needed (after URL replacement to detect if we need it)
        content = add_import_if_needed(content, filepath)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Successfully updated {filepath}")
        else:
            print(f"  ➖ No changes needed for {filepath}")
            
    except Exception as e:
        print(f"  ❌ Error processing {filepath}: {e}")

def main():
    print("🚀 Starting URL replacement script...")
    
    files_to_process = [
        "src/pages/ContestStartPage.tsx",
        "src/components/ViewQuestionComponent.tsx",
        "src/components/Navbar.jsx",
        "src/components/CreateContest.jsx",
        "src/components/ContestList.jsx",
        "src/components/CreateProblem.jsx",
        "src/components/ContestCard.jsx",
        "src/components/Signup.jsx",
    ]
    
    print("📁 Processing files...")
    
    for filepath in files_to_process:
        if os.path.exists(filepath):
            print(f"🔍 Processing: {filepath}")
            process_file(filepath)
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print("\n🎉 URL replacement completed!")
    print("\n📋 Summary:")
    print("  • Added API_URLS imports where needed")
    print("  • Replaced hardcoded URLs with centralized config")
    print("  • Handled dynamic URLs with parameters")
    print("\n🧪 Next steps:")
    print("  1. Test the application: npm run dev")
    print("  2. Check for any compilation errors")
    print("  3. Verify API calls work correctly")

if __name__ == "__main__":
    main()
