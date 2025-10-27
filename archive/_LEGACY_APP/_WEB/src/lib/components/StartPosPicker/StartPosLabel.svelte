<script lang="ts">
	export let customStyles: string = ''; // Optional additional styles
</script>

<div class="label" style={customStyles}>Choose your start position!</div>

<style>
	.label {
		margin-bottom: 10%;
		font-size: 4vh;
		font-family: 'Monotype Corsiva', cursive;
		background-color: rgba(255, 255, 255, 0.5);
		border-radius: 40px;
		padding: 10px 20px;
		text-align: center;
	}

	@media (orientation: portrait) {
		.label {
			margin-bottom: 5%; /* Remove margin for portrait orientation */
			margin-top: 5%; /* Remove margin for portrait orientation */
		}
	}
</style>
