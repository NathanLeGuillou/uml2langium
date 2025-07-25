terminal ID: /[_a-zA-Z][_a-zA-Z0-9]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal INT: /[-+]?[0-9]+/;


type Type = 'Number' | 'Boolean' 



type Unit = 'cm' | 'mm' 



type RotationDirection = 'Clockwise' | 'Counterclockwise' 



type MovementDirection = 'Forward' | 'Backward' | 'Right' | 'Left' 



interface Program {
    functionDef?: FunctionDef[];
}

interface FunctionDef {
    returnType?: Type;
    body: Statement;
    parameters?: Parameter[];
    name: string;
}

interface Statement {
}

interface Assign extends Statement {
    varRef: @VarDecl;
    expression: Expression;
}

interface FunctionCall extends Statement, ExpressionTerm {
    functionDef?: @FunctionDef;
    arguments?: Expression[];
}

interface Expression {
}

interface VarDecl extends Statement {
    type?: Type;
    assign?: Assign;
}

interface Parameter extends VarDecl {
}

interface RobotInstruction extends Statement {
    expression: Expression;
}

interface Rotation extends RobotInstruction {
    rotationDirection: RotationDirection;
}

interface SetSpeed extends RobotInstruction {
    unit: Unit;
}

interface Move extends RobotInstruction {
    unit: Unit;
    movementDirection: MovementDirection;
}

interface Conditionals extends Statement {
    condition: Expression;
    whenTrue?: Statement;
}

interface Block extends Statement {
    statement?: Statement[];
}

interface If extends Conditionals {
    whenFalse?: Statement;
}

interface Loop extends Conditionals {
}

interface BinaryExpression extends Expression {
    leftExpr: Expression;
    rightExpr: Expression;
}

interface ExpressionTerm extends Expression {
}

interface Const extends ExpressionTerm {
    value: bigint;
}

interface Add extends BinaryExpression {
}

interface Sub extends BinaryExpression {
}
