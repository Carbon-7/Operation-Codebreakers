class Challenges {
    constructor() {
        try {
            this.challenges = [
                {
                    description: 'What is the output of this C program?',
                    code: 'int main() {\n    int x = 5, y = 5;\n    printf("%d %d %d\\n", ++x, y++, x);\n    printf("%d %d\\n", x, y);\n    return 0;\n}',
                    solution: '6 5 6\n7 6',
                    explanation: 'First printf: ++x makes x=6, y++ uses 5 then increments, x is 6. Second printf: x is now 7, y is 6.'
                },
                {
                    description: 'What is the value of result?',
                    code: '#define MULTIPLY(x, y) (x) * (y)\n#define SQUARE(x) MULTIPLY(x, x)\nint x = 3;\nint result = SQUARE(x + 2);',
                    solution: '25',
                    explanation: 'Macro expands to (x + 2) * (x + 2) = (3 + 2) * (3 + 2) = 25'
                },
                {
                    description: 'What is the output of this pointer arithmetic?',
                    code: 'int arr[] = {1, 2, 3, 4, 5};\nint *p = arr + 2;\nint *q = &arr[4];\nprintf("%d\\n", *(p + (q - p)/2));',
                    solution: '4',
                    explanation: 'q-p=2 (pointer difference), (q-p)/2=1, so p+1 points to arr[3] which is 4'
                },
                {
                    description: 'What is the size (in bytes) of this union?',
                    code: 'struct inner {\n    char c;\n    short s;\n};\nunion data {\n    int i;\n    struct inner in;\n    char str[3];\n};',
                    solution: '4',
                    explanation: 'struct inner is 4 bytes (char:1 + 1 padding + short:2), union size is max of int(4), struct(4), array(3)'
                },
                {
                    description: 'What is the output?',
                    code: 'void modify(char **ptr) {\n    static char *str = "World";\n    *ptr = str;\n}\n\nint main() {\n    char *str = "Hello";\n    modify(&str);\n    printf("%s", str);\n    return 0;\n}',
                    solution: 'World',
                    explanation: 'modify() changes the pointer str to point to "World" by dereferencing the pointer to pointer'
                },
                {
                    description: 'What is the value of x after these operations?',
                    code: 'unsigned char x = 0xAB;\nx = ~x;\nx = (x << 4) | (x >> 4);\nx = x & 0xF0;',
                    solution: '80',
                    explanation: '~0xAB=0x54, rotate: 0x45, AND with 0xF0 gives 0x80 (128 decimal)'
                },
                {
                    description: 'What is the output?',
                    code: 'int arr[3][2] = {{1,2},{3,4},{5,6}};\nint (*ptr)[2] = arr;\nprintf("%d %d", *(*(ptr+1)+1), *(*ptr+1));',
                    solution: '4 2',
                    explanation: '*(*(ptr+1)+1) is arr[1][1]=4, *(*ptr+1) is arr[0][1]=2'
                },
                {
                    description: 'What is the output?',
                    code: '#include <string.h>\nchar str[] = "Hello\\0World";\nprintf("%d %d", strlen(str), sizeof(str)-1);',
                    solution: '5 11',
                    explanation: 'strlen stops at first \\0 (5), sizeof includes all chars including \\0 (12-1=11)'
                },
                {
                    description: 'What is the output?',
                    code: '#include <stdlib.h>\nint main() {\n    int *ptr = (int*)malloc(5 * sizeof(int));\n    for(int i = 0; i < 5; i++) ptr[i] = i + 1;\n    int *new_ptr = realloc(ptr, 10 * sizeof(int));\n    printf("%d %d", ptr[4], new_ptr[4]);\n    free(new_ptr);\n    return 0;\n}',
                    solution: '5 5',
                    explanation: 'realloc preserves existing data, so both ptr[4] and new_ptr[4] contain 5'
                },
                {
                    description: 'What is the output?',
                    code: '#include <stdlib.h>\nint main() {\n    int **arr = (int**)malloc(3 * sizeof(int*));\n    for(int i = 0; i < 3; i++) {\n        arr[i] = (int*)malloc(2 * sizeof(int));\n        arr[i][0] = i + 1;\n        arr[i][1] = (i + 1) * 2;\n    }\n    printf("%d %d", arr[1][1], *(*(arr + 2) + 1));\n    for(int i = 0; i < 3; i++) free(arr[i]);\n    free(arr);\n    return 0;\n}',
                    solution: '4 6',
                    explanation: 'arr[1][1] is 4, *(*(arr + 2) + 1) is arr[2][1] which is 6'
                }
            ];
            console.log('✅ Challenges initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize challenges:', error);
            throw error;
        }
    }

    get totalChallenges() {
        return this.challenges.length;
    }

    getChallenge(level) {
        if (level > 0 && level <= this.challenges.length) {
            return this.challenges[level - 1];
        }
        return null;
    }

    validateSolution(level, solution) {
        const challenge = this.getChallenge(level);
        if (!challenge) return false;
        
        // Trim whitespace and convert to lowercase for case-insensitive comparison
        const normalizedSolution = solution.trim();
        const normalizedCorrect = challenge.solution.trim();
        
        return normalizedSolution === normalizedCorrect;
    }
}

// Export Challenges class to window object
try {
    window.Challenges = Challenges;
    console.log('✅ Challenges class exported successfully');
} catch (error) {
    console.error('❌ Failed to export Challenges class:', error);
    throw error;
} 