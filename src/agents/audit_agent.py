#!/usr/bin/env python3
"""
AuditAgent - Comprehensive Code Audit Tool for The Breakery POS
Analyzes project structure, code quality, dependencies, database, and security.
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Any, Optional


class AuditAgent:
    """
    AuditAgent analyzes an existing codebase to identify problems,
    generate quality reports, and provide improvement recommendations.
    """

    NOM = "AuditAgent"
    ROLE = "Analyser le code existant et identifier les problèmes"

    def __init__(self, project_root: str):
        """Initialize the AuditAgent with project root path."""
        self.project_root = Path(project_root)
        self.report_data: Dict[str, Any] = {
            "project_structure": {},
            "code_quality": {},
            "dependencies": {},
            "database": {},
            "missing_features": {},
            "security": {},
            "scores": {},
            "recommendations": []
        }
        
        # Directories to ignore during analysis
        self.ignore_dirs = {
            'node_modules', '.git', 'dist', 'build', '.vscode', 
            '__pycache__', '.next', 'coverage', '.cache'
        }
        
        # File extensions to analyze
        self.code_extensions = {
            '.ts', '.tsx', '.js', '.jsx', '.py', '.sql', 
            '.css', '.html', '.json', '.md'
        }

    # =========================================================================
    # 1. ANALYZE PROJECT STRUCTURE
    # =========================================================================
    def analyze_project_structure(self) -> Dict[str, Any]:
        """
        Scanne tous les fichiers/dossiers.
        Identifie l'architecture actuelle.
        Détecte les patterns utilisés.
        Génère un rapport de structure.
        """
        structure = {
            "total_files": 0,
            "total_directories": 0,
            "files_by_extension": defaultdict(int),
            "directories": [],
            "architecture_patterns": [],
            "framework_detected": [],
            "file_tree": {}
        }
        
        # Walk through project
        for root, dirs, files in os.walk(self.project_root):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            rel_root = Path(root).relative_to(self.project_root)
            
            for d in dirs:
                structure["total_directories"] += 1
                structure["directories"].append(str(rel_root / d))
            
            for f in files:
                structure["total_files"] += 1
                ext = Path(f).suffix.lower()
                structure["files_by_extension"][ext] += 1
        
        # Detect patterns and frameworks
        structure["architecture_patterns"] = self._detect_architecture_patterns()
        structure["framework_detected"] = self._detect_frameworks()
        
        # Convert defaultdict to regular dict for JSON serialization
        structure["files_by_extension"] = dict(structure["files_by_extension"])
        
        self.report_data["project_structure"] = structure
        return structure

    def _detect_architecture_patterns(self) -> List[str]:
        """Detect common architecture patterns in the project."""
        patterns = []
        
        # Check for common React patterns
        if (self.project_root / "src" / "components").exists():
            patterns.append("Component-Based Architecture")
        if (self.project_root / "src" / "pages").exists():
            patterns.append("Page-Based Routing")
        if (self.project_root / "src" / "hooks").exists():
            patterns.append("Custom Hooks Pattern")
        if (self.project_root / "src" / "stores").exists():
            patterns.append("State Management (Stores)")
        if (self.project_root / "src" / "services").exists():
            patterns.append("Service Layer Pattern")
        if (self.project_root / "src" / "types").exists():
            patterns.append("TypeScript Type Definitions")
        if (self.project_root / "src" / "layouts").exists():
            patterns.append("Layout Components")
        if (self.project_root / "src" / "locales").exists():
            patterns.append("Internationalization (i18n)")
        if (self.project_root / "supabase").exists():
            patterns.append("Supabase Backend Integration")
        
        return patterns

    def _detect_frameworks(self) -> List[str]:
        """Detect frameworks and libraries used in the project."""
        frameworks = []
        
        package_json = self.project_root / "package.json"
        if package_json.exists():
            with open(package_json, 'r', encoding='utf-8') as f:
                pkg = json.load(f)
                deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                
                if "react" in deps:
                    frameworks.append("React")
                if "vite" in deps:
                    frameworks.append("Vite")
                if "@supabase/supabase-js" in deps:
                    frameworks.append("Supabase")
                if "typescript" in deps:
                    frameworks.append("TypeScript")
                if "@tanstack/react-query" in deps:
                    frameworks.append("TanStack Query")
                if "zustand" in deps:
                    frameworks.append("Zustand (State Management)")
                if "i18next" in deps:
                    frameworks.append("i18next (i18n)")
                if "recharts" in deps:
                    frameworks.append("Recharts (Charts)")
                if "react-router-dom" in deps:
                    frameworks.append("React Router")
        
        return frameworks

    # =========================================================================
    # 2. ANALYZE CODE QUALITY
    # =========================================================================
    def analyze_code_quality(self) -> Dict[str, Any]:
        """
        Vérifie la qualité du code.
        Détecte : code dupliqué, fonctions trop longues, complexité élevée, manque de commentaires.
        Note : /10 par fichier.
        """
        quality = {
            "files_analyzed": 0,
            "total_lines": 0,
            "file_scores": {},
            "issues": [],
            "average_score": 0.0,
            "summary": {}
        }
        
        all_scores = []
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for f in files:
                file_path = Path(root) / f
                ext = file_path.suffix.lower()
                
                if ext in {'.ts', '.tsx', '.js', '.jsx', '.py'}:
                    score, issues, lines = self._analyze_file_quality(file_path)
                    rel_path = str(file_path.relative_to(self.project_root))
                    
                    quality["files_analyzed"] += 1
                    quality["total_lines"] += lines
                    quality["file_scores"][rel_path] = {
                        "score": score,
                        "lines": lines,
                        "issues": issues
                    }
                    all_scores.append(score)
                    
                    for issue in issues:
                        quality["issues"].append({
                            "file": rel_path,
                            "issue": issue
                        })
        
        if all_scores:
            quality["average_score"] = round(sum(all_scores) / len(all_scores), 1)
        
        # Generate summary
        quality["summary"] = {
            "excellent_files": len([s for s in all_scores if s >= 8]),
            "good_files": len([s for s in all_scores if 6 <= s < 8]),
            "needs_improvement": len([s for s in all_scores if 4 <= s < 6]),
            "poor_files": len([s for s in all_scores if s < 4])
        }
        
        self.report_data["code_quality"] = quality
        return quality

    def _analyze_file_quality(self, file_path: Path) -> Tuple[float, List[str], int]:
        """Analyze a single file for code quality metrics."""
        issues = []
        score = 10.0
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
                line_count = len(lines)
        except Exception:
            return 5.0, ["Could not read file"], 0
        
        # Check file length (deduct if too long)
        if line_count > 500:
            score -= 2
            issues.append(f"File too long ({line_count} lines)")
        elif line_count > 300:
            score -= 1
            issues.append(f"File somewhat long ({line_count} lines)")
        
        # Check for long functions (simplified detection)
        function_pattern = r'(function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+\w+)'
        functions = re.findall(function_pattern, content)
        
        # Check for very long lines
        long_lines = [i for i, line in enumerate(lines, 1) if len(line) > 120]
        if len(long_lines) > 10:
            score -= 1
            issues.append(f"{len(long_lines)} lines exceed 120 characters")
        
        # Check for comments (basic check)
        comment_patterns = [r'//.*', r'/\*[\s\S]*?\*/', r'#.*', r'"""[\s\S]*?"""', r"'''[\s\S]*?'''"]
        comment_count = sum(len(re.findall(p, content)) for p in comment_patterns)
        
        comment_ratio = comment_count / max(line_count, 1)
        if comment_ratio < 0.05 and line_count > 50:
            score -= 1
            issues.append("Insufficient comments")
        
        # Check for TODO/FIXME comments
        todos = re.findall(r'(TODO|FIXME|XXX|HACK)', content, re.IGNORECASE)
        if len(todos) > 3:
            score -= 0.5
            issues.append(f"{len(todos)} TODO/FIXME markers found")
        
        # Check for console.log or print statements (debug code)
        debug_statements = len(re.findall(r'console\.(log|warn|error)|print\(', content))
        if debug_statements > 5:
            score -= 1
            issues.append(f"{debug_statements} debug statements found")
        
        # Check for deeply nested code (simplified)
        max_indent = 0
        for line in lines:
            stripped = line.lstrip()
            if stripped:
                indent = len(line) - len(stripped)
                max_indent = max(max_indent, indent)
        
        if max_indent > 24:  # More than 6 levels of indentation (4 spaces each)
            score -= 1
            issues.append("Deeply nested code detected")
        
        # Check for any/unknown types in TypeScript
        if file_path.suffix in {'.ts', '.tsx'}:
            any_count = len(re.findall(r':\s*any\b', content))
            if any_count > 5:
                score -= 1
                issues.append(f"{any_count} 'any' type usages found")
        
        # Ensure score stays in valid range
        score = max(1, min(10, score))
        
        return round(score, 1), issues, line_count

    # =========================================================================
    # 3. ANALYZE DEPENDENCIES
    # =========================================================================
    def analyze_dependencies(self) -> Dict[str, Any]:
        """
        Liste toutes les dépendances.
        Vérifie versions obsolètes.
        Détecte conflits potentiels.
        """
        dependencies = {
            "production": {},
            "development": {},
            "total_count": 0,
            "potential_issues": [],
            "version_warnings": [],
            "recommendations": []
        }
        
        package_json = self.project_root / "package.json"
        if not package_json.exists():
            dependencies["potential_issues"].append("No package.json found")
            self.report_data["dependencies"] = dependencies
            return dependencies
        
        with open(package_json, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
        
        deps = pkg.get("dependencies", {})
        dev_deps = pkg.get("devDependencies", {})
        
        dependencies["production"] = deps
        dependencies["development"] = dev_deps
        dependencies["total_count"] = len(deps) + len(dev_deps)
        
        # Check for common issues
        for name, version in {**deps, **dev_deps}.items():
            # Check for very old major versions (simplified check)
            if version.startswith('^0.') or version.startswith('~0.'):
                dependencies["version_warnings"].append(
                    f"{name}@{version} - Pre-1.0 version, may be unstable"
                )
            
            # Check for exact versions (no caret/tilde)
            if not version.startswith(('^', '~', '>', '<', '*')):
                dependencies["potential_issues"].append(
                    f"{name}@{version} - Pinned to exact version"
                )
        
        # Check for duplicate dependencies in both prod and dev
        overlap = set(deps.keys()) & set(dev_deps.keys())
        if overlap:
            dependencies["potential_issues"].append(
                f"Packages in both production and dev: {', '.join(overlap)}"
            )
        
        # Common upgrade recommendations
        known_outdated = {
            "react": ("18", "Check for React 19 features"),
            "typescript": ("5", "Ensure using latest TypeScript 5.x"),
            "vite": ("5", "Consider Vite 6.x if available")
        }
        
        for pkg_name, (current_major, suggestion) in known_outdated.items():
            if pkg_name in deps or pkg_name in dev_deps:
                version = deps.get(pkg_name) or dev_deps.get(pkg_name)
                if version:
                    dependencies["recommendations"].append(suggestion)
        
        self.report_data["dependencies"] = dependencies
        return dependencies

    # =========================================================================
    # 4. ANALYZE DATABASE
    # =========================================================================
    def analyze_database(self) -> Dict[str, Any]:
        """
        Analyse les tables Supabase existantes.
        Vérifie les relations/contraintes.
        Détecte tables/colonnes non utilisées.
        Vérifie les index manquants.
        """
        database = {
            "tables": [],
            "relationships": [],
            "indexes": [],
            "rls_policies": [],
            "functions": [],
            "triggers": [],
            "issues": [],
            "recommendations": []
        }
        
        migrations_dir = self.project_root / "supabase" / "migrations"
        if not migrations_dir.exists():
            database["issues"].append("No Supabase migrations directory found")
            self.report_data["database"] = database
            return database
        
        # Parse all SQL migration files
        sql_content = ""
        migration_files = sorted(migrations_dir.glob("*.sql"))
        
        for sql_file in migration_files:
            try:
                with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
                    sql_content += f"\n-- File: {sql_file.name}\n"
                    sql_content += f.read()
            except Exception as e:
                database["issues"].append(f"Could not read {sql_file.name}: {str(e)}")
        
        # Extract CREATE TABLE statements
        table_pattern = r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)'
        tables = re.findall(table_pattern, sql_content, re.IGNORECASE)
        database["tables"] = list(set(tables))
        
        # Extract foreign key relationships
        fk_pattern = r'REFERENCES\s+(?:public\.)?(\w+)\s*\((\w+)\)'
        relationships = re.findall(fk_pattern, sql_content, re.IGNORECASE)
        database["relationships"] = [
            {"target_table": r[0], "target_column": r[1]} 
            for r in set(relationships)
        ]
        
        # Extract CREATE INDEX statements
        index_pattern = r'CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)'
        indexes = re.findall(index_pattern, sql_content, re.IGNORECASE)
        database["indexes"] = list(set(indexes))
        
        # Extract RLS policies
        rls_pattern = r'CREATE\s+POLICY\s+"?(\w+)"?'
        policies = re.findall(rls_pattern, sql_content, re.IGNORECASE)
        database["rls_policies"] = list(set(policies))
        
        # Extract functions
        func_pattern = r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?(\w+)'
        functions = re.findall(func_pattern, sql_content, re.IGNORECASE)
        database["functions"] = list(set(functions))
        
        # Extract triggers
        trigger_pattern = r'CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+(\w+)'
        triggers = re.findall(trigger_pattern, sql_content, re.IGNORECASE)
        database["triggers"] = list(set(triggers))
        
        # Generate recommendations
        if len(database["indexes"]) < len(database["tables"]):
            database["recommendations"].append(
                "Consider adding more indexes for frequently queried columns"
            )
        
        if len(database["rls_policies"]) < len(database["tables"]) * 2:
            database["recommendations"].append(
                "Some tables may need additional RLS policies for security"
            )
        
        # Check for tables without RLS enabled
        rls_enable_pattern = r'ALTER\s+TABLE\s+(?:public\.)?(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY'
        rls_enabled = re.findall(rls_enable_pattern, sql_content, re.IGNORECASE)
        tables_without_rls = set(database["tables"]) - set(rls_enabled)
        if tables_without_rls:
            database["issues"].append(
                f"Tables without RLS: {', '.join(list(tables_without_rls)[:5])}"
            )
        
        self.report_data["database"] = database
        return database

    # =========================================================================
    # 5. FIND MISSING FEATURES
    # =========================================================================
    def find_missing_features(self) -> Dict[str, Any]:
        """
        Compare avec les specs complètes.
        Liste ce qui existe vs ce qui manque.
        """
        # Expected features for a complete POS system
        expected_features = {
            "Authentication": {
                "patterns": ["login", "auth", "signin", "signup", "logout"],
                "description": "User authentication and authorization"
            },
            "POS/Sales": {
                "patterns": ["pos", "cart", "checkout", "payment", "sale"],
                "description": "Point of sale functionality"
            },
            "Inventory Management": {
                "patterns": ["inventory", "stock", "product", "warehouse"],
                "description": "Product and stock management"
            },
            "Order Management": {
                "patterns": ["order", "orders"],
                "description": "Order processing and tracking"
            },
            "Kitchen Display System": {
                "patterns": ["kds", "kitchen", "display"],
                "description": "Kitchen order display"
            },
            "Reporting/Analytics": {
                "patterns": ["report", "analytics", "dashboard", "chart"],
                "description": "Business intelligence and reporting"
            },
            "User Management": {
                "patterns": ["user", "staff", "employee", "role"],
                "description": "User and role management"
            },
            "Settings/Configuration": {
                "patterns": ["setting", "config", "preference"],
                "description": "System configuration"
            },
            "Production/Manufacturing": {
                "patterns": ["production", "recipe", "manufacture"],
                "description": "Production management"
            },
            "Purchasing": {
                "patterns": ["purchase", "supplier", "vendor"],
                "description": "Purchase order management"
            },
            "Customer Display": {
                "patterns": ["customer", "display", "screen"],
                "description": "Customer-facing display"
            },
            "B2B/Wholesale": {
                "patterns": ["b2b", "wholesale", "bulk"],
                "description": "Business-to-business sales"
            },
            "Internationalization": {
                "patterns": ["i18n", "locale", "translation", "language"],
                "description": "Multi-language support"
            },
            "Printing": {
                "patterns": ["print", "receipt", "ticket"],
                "description": "Receipt and ticket printing"
            }
        }
        
        features = {
            "existing": [],
            "partial": [],
            "missing": [],
            "coverage_percentage": 0.0
        }
        
        # Collect all file and directory names
        all_paths = set()
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            rel_root = str(Path(root).relative_to(self.project_root)).lower()
            all_paths.add(rel_root)
            
            for d in dirs:
                all_paths.add(d.lower())
            for f in files:
                all_paths.add(f.lower())
                all_paths.add(Path(f).stem.lower())
        
        # Also check file contents for feature-related code
        content_keywords = set()
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            for f in files:
                if Path(f).suffix in {'.ts', '.tsx', '.js'}:
                    try:
                        file_path = Path(root) / f
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                            content = fp.read().lower()
                            # Add key route/component names
                            content_keywords.update(re.findall(r'path:\s*["\']/?(\w+)', content))
                            content_keywords.update(re.findall(r'component\s*=\s*{(\w+)', content))
                    except Exception:
                        pass
        
        all_paths.update(content_keywords)
        
        # Check each expected feature
        existing_count = 0
        for feature_name, feature_info in expected_features.items():
            patterns = feature_info["patterns"]
            matches = [p for p in patterns if any(p in path for path in all_paths)]
            
            if len(matches) >= len(patterns) * 0.5:
                features["existing"].append({
                    "name": feature_name,
                    "description": feature_info["description"],
                    "evidence": matches
                })
                existing_count += 1
            elif matches:
                features["partial"].append({
                    "name": feature_name,
                    "description": feature_info["description"],
                    "found": matches,
                    "missing": [p for p in patterns if p not in matches]
                })
                existing_count += 0.5
            else:
                features["missing"].append({
                    "name": feature_name,
                    "description": feature_info["description"]
                })
        
        features["coverage_percentage"] = round(
            (existing_count / len(expected_features)) * 100, 1
        )
        
        self.report_data["missing_features"] = features
        return features

    # =========================================================================
    # 6. SECURITY AUDIT
    # =========================================================================
    def security_audit(self) -> Dict[str, Any]:
        """
        Cherche : secrets en dur, SQL injection, XSS, authentification faible.
        Liste les problèmes de sécurité.
        """
        security = {
            "critical": [],
            "high": [],
            "medium": [],
            "low": [],
            "total_issues": 0,
            "scanned_files": 0
        }
        
        # Security patterns to detect
        patterns = {
            "critical": [
                (r'(password|passwd|pwd)\s*[=:]\s*["\'][^"\']+["\']', "Hardcoded password"),
                (r'(api[_-]?key|apikey)\s*[=:]\s*["\'][^"\']{10,}["\']', "Hardcoded API key"),
                (r'(secret[_-]?key|secretkey)\s*[=:]\s*["\'][^"\']+["\']', "Hardcoded secret"),
                (r'(private[_-]?key|privatekey)\s*[=:]\s*["\']-----BEGIN', "Hardcoded private key"),
            ],
            "high": [
                (r'eval\s*\(', "Use of eval() - potential code injection"),
                (r'innerHTML\s*=', "Direct innerHTML assignment - XSS risk"),
                (r'dangerouslySetInnerHTML', "dangerouslySetInnerHTML usage - XSS risk"),
                (r'document\.write\s*\(', "document.write usage - XSS risk"),
                (r'exec\s*\(.*\+', "Dynamic command execution"),
            ],
            "medium": [
                (r'http://', "Non-HTTPS URL (except localhost)"),
                (r'localStorage\.setItem\s*\([^,]+,\s*[^)]*password', "Storing sensitive data in localStorage"),
                (r'sessionStorage\.setItem\s*\([^,]+,\s*[^)]*password', "Storing sensitive data in sessionStorage"),
                (r'\.query\s*\(\s*[`"\'].*\$\{', "Potential SQL injection (string interpolation in query)"),
                (r'SELECT\s+\*\s+FROM', "SELECT * usage - may expose sensitive columns"),
            ],
            "low": [
                (r'console\.(log|warn|error)', "Console statements in production code"),
                (r'debugger;', "Debugger statement found"),
                (r'TODO.*security', "Security-related TODO found"),
                (r'FIXME.*auth', "Authentication-related FIXME found"),
            ]
        }
        
        # Files to skip for certain patterns
        skip_patterns = {'node_modules', '.git', 'dist', '.env.example'}
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for f in files:
                file_path = Path(root) / f
                ext = file_path.suffix.lower()
                
                if ext not in self.code_extensions:
                    continue
                
                rel_path = str(file_path.relative_to(self.project_root))
                
                # Skip certain files
                if any(skip in rel_path for skip in skip_patterns):
                    continue
                
                security["scanned_files"] += 1
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                        content = fp.read()
                        lines = content.split('\n')
                        
                        for severity, pattern_list in patterns.items():
                            for pattern, description in pattern_list:
                                matches = re.finditer(pattern, content, re.IGNORECASE)
                                for match in matches:
                                    # Find line number
                                    line_num = content[:match.start()].count('\n') + 1
                                    
                                    # Skip if in .env file for env-related patterns
                                    if '.env' in rel_path and 'VITE_' in match.group():
                                        continue
                                    
                                    # Skip http:// if localhost
                                    if 'http://' in pattern and 'localhost' in match.group():
                                        continue
                                    
                                    security[severity].append({
                                        "file": rel_path,
                                        "line": line_num,
                                        "issue": description,
                                        "snippet": lines[line_num - 1][:80] if line_num <= len(lines) else ""
                                    })
                                    
                except Exception:
                    pass
        
        security["total_issues"] = (
            len(security["critical"]) + 
            len(security["high"]) + 
            len(security["medium"]) + 
            len(security["low"])
        )
        
        self.report_data["security"] = security
        return security

    # =========================================================================
    # 7. GENERATE FULL REPORT
    # =========================================================================
    def generate_full_report(self, output_path: Optional[str] = None) -> str:
        """
        Compile tout en un rapport Markdown avec :
        - Vue d'ensemble du projet
        - Points forts
        - Points à améliorer (par priorité)
        - Recommandations concrètes
        - Plan d'action suggéré
        """
        # Run all analyses if not already done
        if not self.report_data["project_structure"]:
            self.analyze_project_structure()
        if not self.report_data["code_quality"]:
            self.analyze_code_quality()
        if not self.report_data["dependencies"]:
            self.analyze_dependencies()
        if not self.report_data["database"]:
            self.analyze_database()
        if not self.report_data["missing_features"]:
            self.find_missing_features()
        if not self.report_data["security"]:
            self.security_audit()
        
        # Calculate overall scores
        self._calculate_scores()
        
        # Generate report
        report = self._build_markdown_report()
        
        # Write to file
        if output_path is None:
            output_path = self.project_root / "artifacts" / "audit" / "audit_report.md"
        else:
            output_path = Path(output_path)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        return str(output_path)

    def _calculate_scores(self):
        """Calculate overall scores for each category."""
        scores = {}
        
        # Code Quality Score
        cq = self.report_data.get("code_quality", {})
        scores["code_quality"] = cq.get("average_score", 5.0)
        
        # Security Score (10 - penalties)
        sec = self.report_data.get("security", {})
        sec_score = 10.0
        sec_score -= len(sec.get("critical", [])) * 3
        sec_score -= len(sec.get("high", [])) * 2
        sec_score -= len(sec.get("medium", [])) * 0.5
        sec_score -= len(sec.get("low", [])) * 0.1
        scores["security"] = max(1, min(10, round(sec_score, 1)))
        
        # Feature Completeness Score
        mf = self.report_data.get("missing_features", {})
        scores["feature_completeness"] = round(mf.get("coverage_percentage", 50) / 10, 1)
        
        # Database Score
        db = self.report_data.get("database", {})
        db_score = 10.0
        db_score -= len(db.get("issues", [])) * 1
        db_score -= len(db.get("recommendations", [])) * 0.5
        scores["database"] = max(1, min(10, round(db_score, 1)))
        
        # Overall Score
        scores["overall"] = round(
            (scores["code_quality"] + scores["security"] + 
             scores["feature_completeness"] + scores["database"]) / 4, 1
        )
        
        self.report_data["scores"] = scores

    def _build_markdown_report(self) -> str:
        """Build the complete Markdown report."""
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        scores = self.report_data.get("scores", {})
        structure = self.report_data.get("project_structure", {})
        quality = self.report_data.get("code_quality", {})
        deps = self.report_data.get("dependencies", {})
        db = self.report_data.get("database", {})
        features = self.report_data.get("missing_features", {})
        security = self.report_data.get("security", {})
        
        report = f"""# 🔍 Audit Report - The Breakery POS

**Generated:** {now}  
**Project:** {self.project_root}

---

## 📊 Executive Summary

| Category | Score |
|----------|-------|
| **Overall** | **{scores.get('overall', 'N/A')}/10** |
| Code Quality | {scores.get('code_quality', 'N/A')}/10 |
| Security | {scores.get('security', 'N/A')}/10 |
| Feature Completeness | {scores.get('feature_completeness', 'N/A')}/10 |
| Database | {scores.get('database', 'N/A')}/10 |

---

## 📁 Project Structure

### Overview
- **Total Files:** {structure.get('total_files', 0)}
- **Total Directories:** {structure.get('total_directories', 0)}

### Files by Extension
| Extension | Count |
|-----------|-------|
"""
        # Add file extension table
        for ext, count in sorted(
            structure.get('files_by_extension', {}).items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]:
            report += f"| {ext or '(none)'} | {count} |\n"
        
        report += f"""
### Detected Frameworks
"""
        for fw in structure.get('framework_detected', []):
            report += f"- ✅ {fw}\n"
        
        report += f"""
### Architecture Patterns
"""
        for pattern in structure.get('architecture_patterns', []):
            report += f"- 📐 {pattern}\n"
        
        report += f"""
---

## ✨ Strengths

"""
        # List strengths based on analysis
        strengths = []
        if scores.get('code_quality', 0) >= 7:
            strengths.append("High code quality standards maintained")
        if len(structure.get('architecture_patterns', [])) >= 5:
            strengths.append("Well-organized project architecture with clear patterns")
        if 'TypeScript' in structure.get('framework_detected', []):
            strengths.append("TypeScript for type safety")
        if 'i18next' in ' '.join(structure.get('framework_detected', [])):
            strengths.append("Internationalization support implemented")
        if len(db.get('rls_policies', [])) > 5:
            strengths.append("Row-Level Security policies in place")
        if features.get('coverage_percentage', 0) >= 70:
            strengths.append(f"Good feature coverage ({features.get('coverage_percentage')}%)")
        if len(security.get('critical', [])) == 0:
            strengths.append("No critical security vulnerabilities found")
        
        if not strengths:
            strengths.append("Project is functional and running")
        
        for s in strengths:
            report += f"- ✅ {s}\n"
        
        report += f"""
---

## ⚠️ Issues by Priority

### 🔴 Critical Issues
"""
        critical_issues = security.get('critical', [])
        if critical_issues:
            for issue in critical_issues[:10]:
                report += f"- **{issue['issue']}** in `{issue['file']}` (line {issue['line']})\n"
        else:
            report += "- None found ✅\n"
        
        report += """
### 🟠 High Priority
"""
        high_issues = security.get('high', [])
        if high_issues:
            for issue in high_issues[:10]:
                report += f"- **{issue['issue']}** in `{issue['file']}` (line {issue['line']})\n"
        else:
            report += "- None found ✅\n"
        
        report += """
### 🟡 Medium Priority
"""
        medium_issues = security.get('medium', [])[:5]
        poor_quality_files = [
            f for f, data in quality.get('file_scores', {}).items() 
            if data.get('score', 10) < 5
        ][:5]
        
        if medium_issues:
            for issue in medium_issues:
                report += f"- {issue['issue']} in `{issue['file']}`\n"
        if poor_quality_files:
            report += f"- Low quality files detected: {len(poor_quality_files)} files scored < 5/10\n"
        if not medium_issues and not poor_quality_files:
            report += "- None found ✅\n"
        
        report += """
### 🔵 Low Priority
"""
        low_issues = security.get('low', [])
        if low_issues:
            report += f"- {len(low_issues)} console/debug statements found\n"
        
        missing = features.get('missing', [])
        if missing:
            report += f"- {len(missing)} potential features not yet implemented\n"
        
        if not low_issues and not missing:
            report += "- None found ✅\n"
        
        report += f"""
---

## 📦 Dependencies Analysis

**Total Dependencies:** {deps.get('total_count', 0)}

### Production Dependencies ({len(deps.get('production', {}))})
"""
        for name, version in list(deps.get('production', {}).items())[:15]:
            report += f"- `{name}`: {version}\n"
        
        if deps.get('version_warnings'):
            report += "\n### ⚠️ Version Warnings\n"
            for warning in deps.get('version_warnings', [])[:5]:
                report += f"- {warning}\n"
        
        report += f"""
---

## 🗄️ Database Analysis

### Tables ({len(db.get('tables', []))})
"""
        for table in sorted(db.get('tables', []))[:20]:
            report += f"- `{table}`\n"
        
        report += f"""
### Functions ({len(db.get('functions', []))})
"""
        for func in sorted(db.get('functions', []))[:10]:
            report += f"- `{func}()`\n"
        
        report += f"""
### RLS Policies ({len(db.get('rls_policies', []))})
"""
        for policy in sorted(db.get('rls_policies', []))[:10]:
            report += f"- `{policy}`\n"
        
        if db.get('issues'):
            report += "\n### ⚠️ Database Issues\n"
            for issue in db.get('issues', []):
                report += f"- {issue}\n"
        
        report += f"""
---

## 🎯 Feature Coverage

**Coverage:** {features.get('coverage_percentage', 0)}%

### ✅ Existing Features
"""
        for feat in features.get('existing', []):
            report += f"- **{feat['name']}**: {feat['description']}\n"
        
        if features.get('partial'):
            report += "\n### 🔶 Partial Implementation\n"
            for feat in features.get('partial', []):
                report += f"- **{feat['name']}**: {feat['description']}\n"
        
        if features.get('missing'):
            report += "\n### ❌ Missing Features\n"
            for feat in features.get('missing', []):
                report += f"- **{feat['name']}**: {feat['description']}\n"
        
        report += f"""
---

## 🛡️ Security Audit

**Files Scanned:** {security.get('scanned_files', 0)}  
**Total Issues:** {security.get('total_issues', 0)}

| Severity | Count |
|----------|-------|
| Critical | {len(security.get('critical', []))} |
| High | {len(security.get('high', []))} |
| Medium | {len(security.get('medium', []))} |
| Low | {len(security.get('low', []))} |

---

## 📋 Recommendations

### Immediate Actions (This Week)
"""
        # Generate recommendations based on findings
        recommendations = []
        
        if security.get('critical'):
            recommendations.append("🔴 **URGENT**: Fix all critical security issues immediately")
        if security.get('high'):
            recommendations.append("🟠 Address high-priority security vulnerabilities")
        if scores.get('code_quality', 10) < 6:
            recommendations.append("📝 Improve code quality - focus on files with lowest scores")
        if len(deps.get('version_warnings', [])) > 0:
            recommendations.append("📦 Review and update dependencies with version warnings")
        
        if not recommendations:
            recommendations.append("✅ Continue maintaining current quality standards")
        
        for rec in recommendations:
            report += f"1. {rec}\n"
        
        report += """
### Short-term (This Month)
"""
        short_term = []
        if features.get('partial'):
            short_term.append("Complete partially implemented features")
        if db.get('recommendations'):
            short_term.append("Implement database recommendations (indexes, RLS)")
        if security.get('medium'):
            short_term.append("Address medium-priority security concerns")
        
        if short_term:
            for i, rec in enumerate(short_term, 1):
                report += f"{i}. {rec}\n"
        else:
            report += "1. Continue current development roadmap\n"
        
        report += """
### Long-term (This Quarter)
"""
        long_term = []
        if features.get('missing'):
            long_term.append(f"Implement missing features: {', '.join([f['name'] for f in features.get('missing', [])[:3]])}")
        long_term.append("Set up automated code quality checks in CI/CD")
        long_term.append("Implement comprehensive test coverage")
        
        for i, rec in enumerate(long_term, 1):
            report += f"{i}. {rec}\n"
        
        report += f"""
---

## 📅 Suggested Action Plan

| Priority | Task | Estimated Effort |
|----------|------|------------------|
| 🔴 Critical | Fix security vulnerabilities | 1-2 days |
| 🟠 High | Update outdated dependencies | 0.5-1 day |
| 🟡 Medium | Improve low-scoring files | 2-3 days |
| 🔵 Low | Add missing features | 1-2 weeks |
| 🟢 Enhancement | Add test coverage | 1-2 weeks |

---

## 📊 Code Quality Details

### File Scores Distribution
- **Excellent (8-10):** {quality.get('summary', {}).get('excellent_files', 0)} files
- **Good (6-7.9):** {quality.get('summary', {}).get('good_files', 0)} files
- **Needs Improvement (4-5.9):** {quality.get('summary', {}).get('needs_improvement', 0)} files
- **Poor (<4):** {quality.get('summary', {}).get('poor_files', 0)} files

**Average Score:** {quality.get('average_score', 0)}/10

### Files Needing Attention
"""
        # List worst scoring files
        worst_files = sorted(
            quality.get('file_scores', {}).items(),
            key=lambda x: x[1].get('score', 10)
        )[:10]
        
        for file_path, data in worst_files:
            report += f"- `{file_path}`: {data.get('score', 'N/A')}/10\n"
            for issue in data.get('issues', [])[:2]:
                report += f"  - {issue}\n"
        
        report += f"""
---

*This report was automatically generated by AuditAgent v1.0*
"""
        
        return report


# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    """Run the audit agent and generate report."""
    # Get project root (parent of src/agents)
    script_path = Path(__file__).resolve()
    project_root = script_path.parent.parent.parent
    
    print(f"🔍 AuditAgent - Code Audit Tool")
    print(f"📁 Project: {project_root}")
    print("-" * 50)
    
    # Create agent
    agent = AuditAgent(str(project_root))
    
    # Run all analyses
    print("📊 Analyzing project structure...")
    structure = agent.analyze_project_structure()
    print(f"   Found {structure['total_files']} files in {structure['total_directories']} directories")
    
    print("✨ Analyzing code quality...")
    quality = agent.analyze_code_quality()
    print(f"   Average score: {quality['average_score']}/10")
    
    print("📦 Analyzing dependencies...")
    deps = agent.analyze_dependencies()
    print(f"   Found {deps['total_count']} dependencies")
    
    print("🗄️ Analyzing database...")
    db = agent.analyze_database()
    print(f"   Found {len(db['tables'])} tables, {len(db['functions'])} functions")
    
    print("🎯 Finding missing features...")
    features = agent.find_missing_features()
    print(f"   Feature coverage: {features['coverage_percentage']}%")
    
    print("🛡️ Running security audit...")
    security = agent.security_audit()
    print(f"   Found {security['total_issues']} potential issues")
    
    print("-" * 50)
    print("📝 Generating full report...")
    output_path = agent.generate_full_report()
    print(f"✅ Report saved to: {output_path}")
    
    # Print summary
    scores = agent.report_data.get('scores', {})
    print("\n📊 SUMMARY")
    print(f"   Overall Score: {scores.get('overall', 'N/A')}/10")
    print(f"   Code Quality:  {scores.get('code_quality', 'N/A')}/10")
    print(f"   Security:      {scores.get('security', 'N/A')}/10")
    print(f"   Features:      {scores.get('feature_completeness', 'N/A')}/10")
    print(f"   Database:      {scores.get('database', 'N/A')}/10")


if __name__ == "__main__":
    main()
