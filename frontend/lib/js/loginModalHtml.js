const html = `<!-- Login Modal -->
<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="loginModalLabel">Login</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
		<form id="login" action="/resources/library/api.php" method="post">
			<input type="hidden" name="action" value="login">
			<div class="form-group">
				<label for="songName">Email</label>
				<input type="email" class="form-control" name="email" placeholder="your.email@address.com" required>
				<label for="password">Password</label>
				<input type="password" class="form-control" name="password" required>
				<br>
				<p class="invisible text-danger error">Error</p>
			</div>
			
			<button type="submit" class="btn btn-primary">Login</button>
		</form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>`

export default {
  html
}