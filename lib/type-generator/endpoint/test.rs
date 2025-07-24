pub const GET_APPLICATIONS: &str = "/applications"

/// Method: GET
///
/// Does not require authentication
///
pub fn GET_APPLICATION_ASSETS({application_id}) -> String {
	format!(/oauth2/applications/{}/assets, {application_id})
}
