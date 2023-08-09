//The function for escaping
const Escape = function (unescapedInput) {
    let i, tempChar, escapedString = '';

    //Loops through The unescaped input for the length of the input
    for(i = 0; i < unescapedInput.length; i += 1) {
        tempChar = unescapedInput.charAt(i);
        //checks each character for the cases listed below
        //replaces them with their respective escape sequence
        switch(tempChar) {
            case '&':
                escapedString += '&amp;';
                break;
            case '<':
                escapedString += '&lt;';
                break;
            case '>':
                escapedString += '&gt;';
                break;
            case '/':
                escapedString += '&#x2F;';
                break;
            case '"':
                escapedString += '&quot;';
                break;
            case "'":
                escapedString += '&#x27;';
                break;
            default:
                //if no cases are met, the original character is added to it
                escapedString += tempChar;
        }
    }
    //The escaped string is returned
    return escapedString;
};

    //checks to see if the input is a string
    const isString = function (unescapedInput) {
        return typeof unescapedInput === 'string';
    }
    //checks to see if the input is a boolean
    const isBool = function (unescapedInput) {
        return typeof unescapedInput === 'boolean';
    };
    //checks to see if the input is a number
    const isInt = function (unescapedInput) {
        return typeof unescapedInput === 'number';
    };

    //The main escape function
    const EscapeInput = function (input) {
        let escapedOutput;
        //Check for the input type
        if(isString(input)) {
            //If input is a string, the input is escaped
            escapedOutput = Escape(input);
        }
        else if(isBool(input) || isInt(input)) {
            //If input is not a string, it has no need for escaping
            escapedOutput = input;
        }

        //Output is escaped
        return escapedOutput;
    };

/*const UnescapeInput = function (input) {
        return (input
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&#x2F;/g, '/')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")          
          );
}*/

module.exports = {EscapeInput};