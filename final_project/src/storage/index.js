var UserProfile = (function() {
    var userName = "";
  
    var getName = function() {
      return userName;    // Or pull this from cookie/localStorage
    };
  
    var setName = function(name) {
      userName = name;     
      // Also set this in cookie/localStorage
    };
  
    return {
      getName,
      setName
    }
  
  })();
  
export default UserProfile;