#!/usr/bin/env python3
"""
Focify Extension Verification Script
Checks if all required files are present and valid.
"""

import os
import json
import sys

def check_file_exists(filepath, description=""):
    """Check if a file exists and return its status."""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        print(f"✅ {filepath} ({size} bytes) {description}")
        return True
    else:
        print(f"❌ Missing: {filepath} {description}")
        return False

def verify_extension():
    """Verify all extension files are present and valid."""
    print("🔍 Verifying Focify Extension...\n")
    
    all_good = True
    
    # Core files
    core_files = [
        ("manifest.json", "Extension configuration"),
        ("package.json", "Project metadata"),
        ("README.md", "Documentation"),
        ("CHANGELOG.md", "Version history"),
        ("PRIVACY.md", "Privacy policy"),
    ]
    
    print("📄 Core Files:")
    for file, desc in core_files:
        if not check_file_exists(file, desc):
            all_good = False
    
    # Validate manifest.json
    print("\n🔧 Manifest Validation:")
    try:
        with open("manifest.json", "r") as f:
            manifest = json.load(f)
            
        required_keys = ["manifest_version", "name", "version", "permissions", "action"]
        for key in required_keys:
            if key in manifest:
                print(f"✅ manifest.{key}: {manifest[key]}")
            else:
                print(f"❌ Missing manifest key: {key}")
                all_good = False
                
        # Check MV3
        if manifest.get("manifest_version") == 3:
            print("✅ Using Manifest V3")
        else:
            print("❌ Not using Manifest V3")
            all_good = False
            
    except Exception as e:
        print(f"❌ Manifest error: {e}")
        all_good = False
    
    # Assets
    print("\n🎨 Assets:")
    asset_files = [
        ("assets/yt-focus.css", "YouTube styling"),
        ("assets/icons/icon16.png", "16x16 icon"),
        ("assets/icons/icon32.png", "32x32 icon"),
        ("assets/icons/icon48.png", "48x48 icon"),
        ("assets/icons/icon128.png", "128x128 icon"),
    ]
    
    for file, desc in asset_files:
        if not check_file_exists(file, desc):
            all_good = False
    
    # Rules
    print("\n🚫 Blocking Rules:")
    if check_file_exists("rules/dnr_static.json", "Static DNR rules"):
        try:
            with open("rules/dnr_static.json", "r") as f:
                rules = json.load(f)
            print(f"✅ Found {len(rules)} static blocking rules")
        except Exception as e:
            print(f"❌ DNR rules error: {e}")
            all_good = False
    else:
        all_good = False
    
    # Source files
    print("\n💻 Source Code:")
    src_files = [
        ("src/background/sw.js", "Service worker"),
        ("src/content/main.js", "Content script"),
        ("src/popup/popup.html", "Popup UI"),
        ("src/popup/popup.js", "Popup logic"),
        ("src/popup/popup.css", "Popup styling"),
        ("src/options/options.html", "Options page"),
        ("src/options/options.js", "Options logic"),
        ("src/options/options.css", "Options styling"),
    ]
    
    for file, desc in src_files:
        if not check_file_exists(file, desc):
            all_good = False
    
    # Common utilities
    print("\n🔧 Common Utilities:")
    common_files = [
        ("src/common/constants.js", "Constants"),
        ("src/common/storage.js", "Storage helpers"),
        ("src/common/messaging.js", "Message types"),
        ("src/common/modes.js", "Focus modes"),
        ("src/common/utils.js", "Utilities"),
    ]
    
    for file, desc in common_files:
        if not check_file_exists(file, desc):
            all_good = False
    
    # Summary
    print("\n" + "="*50)
    if all_good:
        print("🎉 Extension verification PASSED!")
        print("\n📋 Next steps:")
        print("1. Open Chrome and go to chrome://extensions")
        print("2. Enable 'Developer mode'")
        print("3. Click 'Load unpacked'")
        print("4. Select the focify folder")
        print("5. Pin the extension and test with Alt+Shift+F")
        return True
    else:
        print("❌ Extension verification FAILED!")
        print("Please fix the missing files before loading the extension.")
        return False

if __name__ == "__main__":
    if verify_extension():
        sys.exit(0)
    else:
        sys.exit(1)
