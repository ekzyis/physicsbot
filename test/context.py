"""
This file is used to insert the src directory into PYTHONPATH.
This way, the imports which are relative to the src directory in the src modules can be resolved when
importing them in test modules.

For example, if we import a file via `from src.util.embed import get_embed_with_title`
in *test/test_get_embed_with_title.py* but in *src/util/embed.py*
we import something from another file in the src directory like `from const import WHITE_CHECKMARK`,
the test module would fail with following errors:
    ImportError: Failed to import test module: test.test_get_lecture_embed
    & ModuleNotFoundError: No module named 'const'
"""

import sys
from pathlib import Path

src_dir = Path(__file__).parent / '../src'
sys.path.insert(0, str(src_dir))
